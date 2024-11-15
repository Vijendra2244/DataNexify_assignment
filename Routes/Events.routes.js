const express = require("express");
const { OAUTHCLIENT } = require("../config/googleClient.config");
const { User } = require("../models/User.models");
const { google } = require("googleapis");

const googleEventsRoutes = express.Router();

// Create Calendar Events

googleEventsRoutes.post("/calendar/create", async (req, res) => {
  try {
    const { googleId, event } = req.body;
    const getTheUser = await User.findOne({ googleId });
    console.log(getTheUser, "exiting user getting");
    if (!getTheUser) {
      return res.status(404).send({
        msg: "Fail",
        data: "User not found with this google id",
      });
    }
    OAUTHCLIENT.setCredentials({ access_token: getTheUser.accessToken });

    const calendar = google.calendar({ version: "v3", auth: OAUTHCLIENT });

    console.log(calendar, "calender event ");

    const EventResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary: event.name,
        start: {
          dateTime: event.start,
        },
        end: {
          dateTime: event.end,
        },
      },
    });

    console.log(EventResponse, "response making");

    res.status(200).send({
      msg: "Success",
      data: EventResponse.data,
    });
  } catch (error) {
    console.error("Authentication error:", error.response?.data || error);
    res.status(500).send({
      msg: "Authentication failed via Google OAuth2",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = {
  googleEventsRoutes,
};
