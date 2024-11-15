const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

const OAUTHCLIENT = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:4040/auth/google/callback"
);

module.exports = {
  OAUTHCLIENT,
};
