const TaskService = require('../services/TaskService');

class TaskController {
  async createTask(req, res, next) {
    try {
      const { title, inputText, operation } = req.body;
      const task = await TaskService.createTask(req.user.userId, title, inputText, operation);
      res.status(201).json({ status: 'success', data: { task } });
    } catch (err) {
      next(err);
    }
  }

  async getTasks(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await TaskService.getUserTasks(req.user.userId, page, limit);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await TaskService.getTask(req.params.id, req.user.userId);
      res.status(200).json({ status: 'success', data: { task } });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
