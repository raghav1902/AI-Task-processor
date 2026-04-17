const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, password } = req.body;
      await AuthService.register(username, password);
      res.status(201).json({ status: 'success', message: 'User registered successfully' });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(username, password);

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        status: 'success',
        accessToken,
        username: user.username
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { username } = req.body;
      const resetToken = await AuthService.generatePasswordReset(username);
      
      // Sending token back ONLY for simulation. In production, return generic success msg.
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email (simulated)',
        resetToken // Mocking the email delivery for testing bypass
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password completely reset'
      });
    } catch (err) {
      next(err);
    }
  }
  
  logout(req, res) {
    res.cookie('jwt', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ status: 'success', message: 'Logged out' });
  }
}

module.exports = new AuthController();
