const express = require("express");
const { OAUTHCLIENT } = require("../config/googleClient.config");
const { User } = require("../models/User.models");
const { google } = require("googleapis");
const moment = require("moment");

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

googleEventsRoutes.get("/users/get", async (req, res) => {
  try {
    const { googleId } = req.query;

    if (!googleId) {
      return res.status(400).send({
        msg: "Fail",
        data: "Google ID is required",
      });
    }

    const user = await User.findOne({ googleId });
    if (!user) {
      return res.status(404).send({
        msg: "Fail",
        data: "User not found with this Google ID",
      });
    }

    OAUTHCLIENT.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: OAUTHCLIENT });
    const currentDate = moment().toISOString(); // Get current date
    const oneMonthAgo = moment().subtract(1, "months").toISOString();

    try {
      const eventsResponse = await calendar.events.list({
        calendarId: "primary",
        timeMin: oneMonthAgo, // Start of the range
        timeMax: currentDate, // End of the range
        maxResults: 100, // You can adjust this number
        orderBy: "startTime", // Ensure events are sorted by date
        singleEvents: true,
      });
      const sortedEvents = eventsResponse.data.items.reverse();
      return res.status(200).send({
        msg: "Success",
        events: sortedEvents,
      });
    } catch (error) {
      if (
        error.response?.data?.error === "invalid_grant" ||
        error.response?.data?.error === "authError" ||
        error.response?.status === 401
      ) {
        console.log("Access token expired. Attempting to refresh...");

        const { credentials } = await OAUTHCLIENT.refreshAccessToken();
        user.accessToken = credentials.access_token;

        await user.save();

        console.log("Access token refreshed. Retrying event fetch...");

        OAUTHCLIENT.setCredentials({
          access_token: user.accessToken,
          refresh_token: user.refreshToken,
        });

        const retryEventsResponse = await calendar.events.list({
          calendarId: "primary",
          timeMin: oneMonthAgo, // Start of the range
          timeMax: currentDate, // End of the range
          maxResults: 100, // You can adjust this number
          orderBy: "startTime", // Ensure events are sorted by date
          singleEvents: true,
        });
        const sortedEvents = retryEventsResponse.data.items.reverse();
        return res.status(200).send({
          msg: "Success",
          events: sortedEvents,
        });
      } else {
        console.error(
          "Error fetching events:",
          error.response?.data || error.message
        );
        return res.status(500).send({
          msg: "Fail",
          data: "Failed to fetch events",
          error: error.response?.data || error.message,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).send({
      msg: "Fail",
      data: "An unexpected error occurred",
      error: error.response?.data || error.message,
    });
  }
});

googleEventsRoutes.post("/sendInvitation", async (req, res) => {
  try {
    const { googleId, eventId, attendees } = req.body;
    if (!googleId || !eventId || !attendees || attendees.length === 0) {
      return res.status(400).send({
        msg: "Fail",
        data: "Google ID, Event ID, and Attendees are required",
      });
    }

    const user = await User.findOne({ googleId });
    if (!user) {
      return res.status(404).send({
        msg: "Fail",
        data: "User not found with this Google ID",
      });
    }

     OAUTHCLIENT.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: OAUTHCLIENT });

    // Get the current event details
    const event = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    // Add attendees to the event
    const updatedEvent = {
      ...event.data,
      attendees: [
        ...event.data.attendees,
        ...attendees.map((email) => ({ email }))
      ],
    };

    // Update the event with attendees
    const updatedEventResponse = await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      resource: updatedEvent,
    });

    return res.status(200).send({
      msg: "Success",
      event: updatedEventResponse.data, // Return the updated event details
    });
  } catch (error) {
    console.error("Error sending invitation:", error.message);
    return res.status(500).send({
      msg: "Fail",
      data: "Failed to send invitation",
      error: error.message,
    });
  }
});


module.exports = {
  googleEventsRoutes,
};
