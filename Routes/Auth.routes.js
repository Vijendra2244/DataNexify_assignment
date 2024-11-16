const express = require("express");
const { OAUTHCLIENT } = require("../config/googleClient.config");
const { google } = require("googleapis");
const { User } = require("../models/User.models");

const googleOAuthRoutes = express.Router();

// Google Sign-in Routes

googleOAuthRoutes.get("/google", (req, res) => {
  try {
    const url = OAUTHCLIENT.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
    res.redirect(url);
  } catch (error) {
    console.log(`Getting error while creating a redirect Url ${error}`);
  }
});

// Google Auth callback routes

googleOAuthRoutes.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    console.log(code, "code");
    const { tokens } = await OAUTHCLIENT.getToken(code);
    console.log(tokens, "tokens");
    OAUTHCLIENT.setCredentials(tokens);

    const oauth2 = google.oauth2({
      version: "v2",
      auth: OAUTHCLIENT,
    });

    console.log(oauth2, "oatuh2");
    console.log(await oauth2.userinfo.get(), "getitign user infos");
    const { data } = await oauth2.userinfo.get();
    console.log(data, "user data");
    let user = await User.findOne({
      googleId: data.id,
    });

    console.log(user, "user");
    console.log(tokens.access_token, "access");
    console.log(tokens.refresh_token, "refresh");
    if (!user) {
      user = new User({
        googleId: data.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
      });
    } else {
      user.accessToken = tokens.access_token;
      if (tokens.refresh_token) {
        user.refreshToken = tokens.refresh_token;
      }
    }
    await user.save();
    console.log("after saving the user", user);
    res.redirect(`http://localhost:5173/dashboard?code=${code}`);
  } catch (error) {
    console.error("Authentication error:", error.response?.data || error);
    console.log(error.response?.data || error.message);
    res.status(500).send({
      msg: "Fail",
      data: "Authetication failed via Google Oauth2",
    });
  }
});

//route for getting the use info

googleOAuthRoutes.get("/auth/google/fetch-user", async (req, res) => {
  try {
    const { code } = req.query; // Authorization code received after login
    if (!code) {
      return res
        .status(400)
        .send({ success: false, message: "Authorization code is required" });
    }

    console.log("Authorization code received:", code);

    // Exchange code for tokens
    const { tokens } = await OAUTHCLIENT.getToken(code);
    OAUTHCLIENT.setCredentials(tokens);

    // Use OAuth2 API to fetch user info
    const oauth2 = google.oauth2({ version: "v2", auth: OAUTHCLIENT });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log("User info retrieved:", userInfo);

    // Save or update the user in the database
    let user = await User.findOne({ googleId: userInfo.id });
    if (!user) {
      user = new User({
        googleId: userInfo.id,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
      });
    } else {
      user.accessToken = tokens.access_token;
      if (tokens.refresh_token) {
        user.refreshToken = tokens.refresh_token;
      }
    }
    await user.save();

    // Respond with the user data
    res.status(200).send({ success: true, user: userInfo, tokens });
  } catch (error) {
    console.error(
      "Error fetching user info:",
      error.response?.data || error.message
    );
    res.status(500).send({
      success: false,
      message: "Failed to fetch user info",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = {
  googleOAuthRoutes,
};
