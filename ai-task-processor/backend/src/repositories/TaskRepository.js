const Task = require('../../models/Task');

class TaskRepository {
  async create(taskData) {
    const task = new Task(taskData);
    return task.save();
  }

  async findByUserId(userId, limit, skip) {
    return Task.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async countByUserId(userId) {
    return Task.countDocuments({ userId });
  }

  async findOne(id, userId) {
    return Task.findOne({ _id: id, userId });
  }
}

module.exports = new TaskRepository();
