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
    res.redirect(
      `https://data-nexify-frontend.vercel.app/dashboard?user=${encodeURIComponent(
        JSON.stringify({
          googleId: user.googleId,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        })
      )}`
    );
  } catch (error) {
    console.error("Authentication error:", error.response?.data || error);
    console.log(error.response?.data || error.message);
    res.status(500).send({
      msg: "Fail",
      data: "Authetication failed via Google Oauth2",
    });
  }
});

// Logout route for google

googleOAuthRoutes.post("/google/logout", async (req, res) => {
  try {
    const { googleId } = req.body;

    if (!googleId) {
      return res.status(400).send({ msg: "Fail", error: "Google ID is required" });
    }

    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).send({ msg: "Fail", error: "User not found" });
    }

    // Revoke the user's access token
    await OAUTHCLIENT.revokeToken(user.accessToken);

    // Optionally, clear tokens from the database
    user.accessToken = null;
    user.refreshToken = null;
    await user.save();

    // Respond with success
    res.status(200).send({
      msg: "Success",
      data: "User logged out successfully, tokens revoked",
    });
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).send({
      msg: "Fail",
      error: "Failed to log out the user",
    });
  }
});

module.exports = {
  googleOAuthRoutes,
};
