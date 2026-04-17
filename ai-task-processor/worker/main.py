import os
import redis
import json
import time
import logging
from pymongo import MongoClient
from bson.objectid import ObjectId
from concurrent.futures import ThreadPoolExecutor

# Configure logging to output JSON structured logs
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "time": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage()
        }
        return json.dumps(log_record)

logger = logging.getLogger("WorkerLogger")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setFormatter(JsonFormatter())
logger.addHandler(ch)

redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379')
# Workaround for redis tls string
if redis_url.startswith('rediss://'):
    r = redis.Redis.from_url(redis_url, ssl_cert_reqs=None)
else:
    r = redis.Redis.from_url(redis_url)

mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/ai-task-processor')
client = MongoClient(mongo_uri)
db = client.get_database()
tasks_collection = db['tasks']

def process_job(job_data_str):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            job = json.loads(job_data_str)
            task_id = job.get('taskId')
            input_text = job.get('inputText')
            operation = job.get('operation')

            if not task_id:
                logger.error("Job missing taskId, discarding.")
                return

            logger.info(f"Picked up task {task_id}")

            # Safe MongoDB update ensuring idempotency
            update_res = tasks_collection.update_one(
                {'_id': ObjectId(task_id), 'status': 'pending'},
                {'$set': {'status': 'running'}, '$push': {'logs': f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Started execution via worker thread (Attempt {attempt+1})" }}
            )
            
            # Idempotency check: if modified_count == 0, another worker grabbed it or it's not pending
            if update_res.modified_count == 0 and attempt == 0:
                logger.warning(f"Task {task_id} already processing or not pending.")
                return

            time.sleep(2) # Simulate AI processing load

            result = ""
            if operation == 'uppercase':
                result = input_text.upper()
            elif operation == 'lowercase':
                result = input_text.lower()
            elif operation == 'reverse string':
                result = input_text[::-1]
            elif operation == 'word count':
                result = str(len(input_text.split()))
            elif operation == 'base64 encode':
                import base64
                result = base64.b64encode(input_text.encode('utf-8')).decode('utf-8')
            elif operation == 'base64 decode':
                import base64
                try:
                    result = base64.b64decode(input_text.encode('utf-8')).decode('utf-8')
                except Exception:
                    result = "[Error] Invalid Base64 String"
            elif operation == 'character count':
                result = str(len(input_text))
            elif operation == 'capitalize words':
                result = input_text.title()
            elif operation == 'remove whitespace':
                import re
                result = re.sub(r'\\s+', '', input_text)
            else:
                raise ValueError(f"Unknown operation: {operation}")

            tasks_collection.update_one(
                {'_id': ObjectId(task_id)},
                {
                    '$set': {'status': 'success', 'result': result},
                    '$push': {'logs': f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Execution finished successfully"}
                }
            )
            logger.info(f"Task {task_id} finished successfully")
            break # Break out of retry loop if successful

        except Exception as e:
            logger.error(f"Error processing job on attempt {attempt+1}: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt) # Exponential backoff retry
            else:
                # Exhausted retries
                try:
                    job = json.loads(job_data_str)
                    task_id = job.get('taskId')
                    if task_id:
                        tasks_collection.update_one(
                            {'_id': ObjectId(task_id)},
                            {
                                '$set': {'status': 'failed'},
                                '$push': {'logs': f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Execution failed after {max_retries} attempts: {str(e)}"}
                            }
                        )
                except Exception as inner_e:
                    logger.error(f"Critical failure while failing task: {str(inner_e)}")

def listen_for_jobs():
    logger.info("Starting Python AI Worker ThreadPool Listener...")
    # Use ThreadPoolExecutor to handle processing concurrently without blocking `brpop`
    with ThreadPoolExecutor(max_workers=5) as executor:
        while True:
            try:
                # brpop returns a tuple (queue_name, data) and blocks automatically
                job = r.brpop('task_queue', timeout=0)
                if job:
                    job_data = job[1].decode('utf-8')
                    executor.submit(process_job, job_data)
            except redis.exceptions.ConnectionError as e:
                logger.error(f"Redis connection dropped: {e}")
                time.sleep(5)
            except Exception as e:
                logger.error(f"Unexpected queue error: {e}")
                time.sleep(5)

if __name__ == '__main__':
    listen_for_jobs()
