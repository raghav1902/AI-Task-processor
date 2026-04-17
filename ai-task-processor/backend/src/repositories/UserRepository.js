const User = require('../../models/User');

class UserRepository {
  async findByUsername(username) {
    return User.findOne({ username });
  }

  async findByResetToken(token) {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async update(userId, data) {
    return User.findByIdAndUpdate(userId, data, { new: true });
  }
}

module.exports = new UserRepository();
