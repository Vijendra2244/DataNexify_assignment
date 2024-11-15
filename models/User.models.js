const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};
