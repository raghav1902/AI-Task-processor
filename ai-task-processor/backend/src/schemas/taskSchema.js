const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  inputText: Joi.string().min(1).max(5000).required(),
  operation: Joi.string().valid('uppercase', 'lowercase', 'reverse string', 'word count', 'base64 encode', 'base64 decode', 'character count', 'capitalize words', 'remove whitespace').required()
});

module.exports = { createTaskSchema };
