import os
import redis
import json
import time
import logging
from pymongo import MongoClient
from bson.objectid import ObjectId
from concurrent.futures import ThreadPoolExecutor

# 1. Logging Setup
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

# 2. Redis Configuration (Upstash SSL Fix)
# Yahan hum hardcoded URL use kar rahe hain jo aapne diya tha
raw_redis_url = "redis://default:gQAAAAAAAS1QAAIncDE4MWU5YzYyNjcyNmE0MjY3YThjOWQ2NjU3NWVhZjliMnAxNzcxMzY@patient-vervet-77136.upstash.io:6379"

# Force 'rediss://' for Upstash
if 'upstash.io' in raw_redis_url and raw_redis_url.startswith('redis://'):
    redis_url = raw_redis_url.replace('redis://', 'rediss://', 1)
else:
    redis_url = raw_redis_url

# Connection with pooling and timeouts to prevent 'Socket Timeout'
r = redis.from_url(
    redis_url, 
    ssl_cert_reqs=None, 
    decode_responses=False,
    socket_connect_timeout=10,
    socket_keepalive=True,
    retry_on_timeout=True
)

# 3. MongoDB Configuration
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/ai_task_db')
client = MongoClient(mongo_uri)
db = client['ai_task_db']
tasks_collection = db['tasks']

# 4. Task Processing Logic
def process_job(job_data_str):
    try:
        job = json.loads(job_data_str)
        task_id = job.get('taskId')
        input_text = job.get('inputText', '')
        operation = job.get('operation', '')

        if not task_id: return

        logger.info(f"Processing Task: {task_id}")

        # Update DB to 'running'
        tasks_collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {'status': 'running'}, '$push': {'logs': f"[{time.strftime('%H:%M:%S')}] Worker started processing"}}
        )

        time.sleep(2) # Simulate processing delay

        # Logic Operations
        result = ""
        if operation == 'uppercase': result = input_text.upper()
        elif operation == 'lowercase': result = input_text.lower()
        elif operation == 'reverse string': result = input_text[::-1]
        elif operation == 'word count': result = str(len(input_text.split()))
        elif operation == 'character count': result = str(len(input_text))
        else: result = f"Processed: {input_text}"

        # Update DB to 'success'
        tasks_collection.update_one(
            {'_id': ObjectId(task_id)},
            {
                '$set': {'status': 'success', 'result': result},
                '$push': {'logs': f"[{time.strftime('%H:%M:%S')}] Task completed successfully"}
            }
        )
        logger.info(f"Task {task_id} Success")

    except Exception as e:
        logger.error(f"Error in process_job: {e}")

# 5. Main Listener Loop
def listen_for_jobs():
    logger.info("Starting Worker Listener (Upstash Optimized)...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        while True:
            try:
                # Timeout is kept at 20s to avoid Upstash dropping the idle connection
                job = r.brpop('task_queue', timeout=20)
                if job:
                    job_data = job[1].decode('utf-8')
                    executor.submit(process_job, job_data)
            except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
                # This is normal for serverless Redis, just continue the loop
                continue 
            except Exception as e:
                logger.error(f"Unexpected Error: {e}")
                time.sleep(5)

if __name__ == '__main__':
    listen_for_jobs()