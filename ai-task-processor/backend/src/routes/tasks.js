const express = require('express');
const TaskController = require('../controllers/TaskController');
const validate = require('../middlewares/validate');
const { createTaskSchema } = require('../schemas/taskSchema');
const auth = require('../middlewares/auth');

const router = express.Router();

router.use(auth); // All task routes are protected

router.post('/', validate(createTaskSchema), TaskController.createTask);
router.get('/', TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);

module.exports = router;
