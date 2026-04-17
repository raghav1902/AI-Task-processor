const { createClient } = require('redis');
const TaskRepository = require('../repositories/TaskRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class TaskService {
  constructor() {
    this.redisClient = null;
    this.initRedis();
  }

  async initRedis() {
    this.redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    this.redisClient.on('error', (err) => logger.error(`Redis Error: ${err}`));
    try {
      await this.redisClient.connect();
      logger.info('Connected to Redis inside TaskService');
    } catch (error) {
      logger.error(`Failed to connect Redis: ${error.message}`);
    }
  }

  async createTask(userId, title, inputText, operation) {
    const task = await TaskRepository.create({
      userId,
      title,
      inputText,
      operation,
      status: 'pending'
    });

    if (this.redisClient.isReady) {
      await this.redisClient.lPush('task_queue', JSON.stringify({
        taskId: task._id.toString(),
        inputText,
        operation
      }));
    } else {
      logger.error('Redis client not ready. Task queued in DB only.');
    }

    return task;
  }

  async getUserTasks(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const tasks = await TaskRepository.findByUserId(userId, limit, skip);
    const total = await TaskRepository.countByUserId(userId);
    
    return {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTask(id, userId) {
    const task = await TaskRepository.findOne(id, userId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }
}

module.exports = new TaskService();
