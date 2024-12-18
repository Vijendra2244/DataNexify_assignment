const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

const OAUTHCLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://datanexify-assignment.onrender.com/auth/google/callback"
);

module.exports = {
  OAUTHCLIENT,
};
