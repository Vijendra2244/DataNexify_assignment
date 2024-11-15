const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectToDB = mongoose.connect(process.env.MONGODB_URI);

module.exports = {
  connectToDB,
};
