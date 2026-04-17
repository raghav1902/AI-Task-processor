const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../repositories/UserRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class AuthService {
  async register(username, password) {
    const existing = await UserRepository.findByUsername(username);
    if (existing) throw new AppError('Username already taken', 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserRepository.create({ username, password: hashedPassword });
    logger.info(`New user registered: ${username}`);
    return user;
  }

  async login(username, password) {
    const user = await UserRepository.findByUsername(username);
    if (!user) throw new AppError('Invalid credentials', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret', { expiresIn: '7d' });

    return { user, accessToken, refreshToken };
  }

  async generatePasswordReset(username) {
    const user = await UserRepository.findByUsername(username);
    if (!user) throw new AppError('No user with that username', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await UserRepository.update(user._id, { resetPasswordToken, resetPasswordExpire });

    // In a real app, send an email. For this scenario, we mock it via logger/response
    logger.info(`Reset token generated for ${username}: ${resetToken}`);
    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findByResetToken(resetPasswordToken);

    if (!user) {
      throw new AppError('Invalid or expired token', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.update(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined
    });

    logger.info(`Password reset successfully for ${user.username}`);
  }
}

module.exports = new AuthService();
