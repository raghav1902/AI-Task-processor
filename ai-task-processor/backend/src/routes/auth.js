const express = require('express');
const AuthController = require('../controllers/AuthController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/userSchema');

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/logout', AuthController.logout);

module.exports = router;
