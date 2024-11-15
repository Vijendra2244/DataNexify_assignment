const express = require("express");
const dotenv = require("dotenv");
const { connectToDB } = require("./config/db.config");
dotenv.config();
const cors = require("cors");
const { googleOAuthRoutes } = require("./Routes/Auth.routes");
const { googleEventsRoutes } = require("./Routes/Events.routes");

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", googleOAuthRoutes);
app.use("/event", googleEventsRoutes);

// home page for test server
app.get("/", (req, res) => {
  try {
    res
      .status(200)
      .send(
        "Home Page for managing and interacting with Google Calendar events."
      );
  } catch (error) {
    res.status(400).send({
      msg: "Fail",
      data: "Some Error occuring while using the home route handler",
    });
  }
});

// google configurations

app.listen(PORT, async () => {
  try {
    await connectToDB
      .then((res) => console.log("DB connected successfully"))
      .catch((err) =>
        console.log("Some error is occuring while connected to DB")
      );
    console.log(`App is running at port ${PORT}`);
  } catch (error) {
    console.log(`Error while running the app at port ${PORT}`);
  }
});
