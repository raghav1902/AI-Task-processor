const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  username: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
