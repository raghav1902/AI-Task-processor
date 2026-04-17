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

# UPSTASH REDIS CONFIGURATION
# Note: Upstash requires 'rediss://' (with double 's') for SSL connections
raw_redis_url = "redis://default:gQAAAAAAAS1QAAIncDE4MWU5YzYyNjcyNmE0MjY3YThjOWQ2NjU3NWVhZjliMnAxNzcxMzY@patient-vervet-77136.upstash.io:6379"

# Automatically fix URL for SSL if it's an Upstash/External URL
if 'upstash.io' in raw_redis_url and raw_redis_url.startswith('redis://'):
    redis_url = raw_redis_url.replace('redis://', 'rediss://', 1)
else:
    redis_url = raw_redis_url

logger.info(f"Connecting to Redis at: {redis_url.split('@')[-1]}") # Log safe URL

# Setup Redis Client with SSL fixes for Upstash
try:
    if redis_url.startswith('rediss://'):
        r = redis.from_url(
            redis_url, 
            ssl_cert_reqs=None, 
            decode_responses=False, # Set to False to handle bytes manually like your original code
            socket_timeout=5,
            retry_on_timeout=True
        )
    else:
        r = redis.from_url(redis_url, decode_responses=False)
except Exception as e:
    logger.error(f"Failed to initialize Redis: {e}")

# MONGODB CONFIGURATION
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/ai-task-processor')
client = MongoClient(mongo_uri)
# Using 'ai_task_db' as per your manual setup
db = client['ai_task_db']
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

            # Safe MongoDB update
            update_res = tasks_collection.update_one(
                {'_id': ObjectId(task_id), 'status': 'pending'},
                {'$set': {'status': 'running'}, '$push': {'logs': f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Started execution via worker (Attempt {attempt+1})" }}
            )
            
            if update_res.modified_count == 0 and attempt == 0:
                logger.warning(f"Task {task_id} already processing or not pending.")
                return

            time.sleep(2) # Simulate processing

            result = ""
            if operation == 'uppercase':
                result = input_text.upper()
            elif operation == 'lowercase':
                result = input_text.lower()
            elif operation == 'reverse string':
                result = input_text[::-1]
            elif operation == 'word count':
                result = str(len(input_text.split()))
            elif operation == 'character count':
                result = str(len(input_text))
            elif operation == 'capitalize words':
                result = input_text.title()
            elif operation == 'remove whitespace':
                import re
                result = re.sub(r'\s+', '', input_text)
            else:
                result = f"Operation {operation} not implemented"

            tasks_collection.update_one(
                {'_id': ObjectId(task_id)},
                {
                    '$set': {'status': 'success', 'result': result},
                    '$push': {'logs': f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Execution finished successfully"}
                }
            )
            logger.info(f"Task {task_id} finished successfully")
            break 

        except Exception as e:
            logger.error(f"Error processing job on attempt {attempt+1}: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                try:
                    job = json.loads(job_data_str)
                    task_id = job.get('taskId')
                    if task_id:
                        tasks_collection.update_one(
                            {'_id': ObjectId(task_id)},
                            {
                                '$set': {'status': 'failed'},
                                '$push': {'logs': f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Execution failed: {str(e)}"}
                            }
                        )
                except Exception as inner_e:
                    logger.error(f"Critical failure: {str(inner_e)}")

def listen_for_jobs():
    logger.info("Starting Python AI Worker ThreadPool Listener...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        while True:
            try:
                # BRPOP returns (key, value)
                job = r.brpop('task_queue', timeout=30)
                if job:
                    job_data = job[1].decode('utf-8')
                    executor.submit(process_job, job_data)
            except redis.exceptions.ConnectionError as e:
                logger.error(f"Redis connection dropped: {e}. Retrying in 5s...")
                time.sleep(5)
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                time.sleep(5)

if __name__ == '__main__':
    listen_for_jobs()