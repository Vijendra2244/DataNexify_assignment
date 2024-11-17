# DataNexify_assignment

# **Google Calendar Integration Backend**

# Important point --> I have deployed my backend on Render, a free hosting platform for backend services. Since it's free, the server goes into sleep mode when not in continuous use, which might cause a delay when hitting the API for the first time after inactivity.

# to use this first make a repo clone 

# to run this server on local host use this command  --> npm run dev

# Create a .env file in the root directory and set the following environment variables:
     PORT=your local port  
     MONGO_URI=your mangoDB URI  connection string  
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     GOOGLE_REDIRECT_URI=your call back redirect URI


## **Features**

- Google OAuth 2.0 Authentication.
- Fetch events from the user's Google Calendar.
- Create events directly in the Google Calendar.
- Handle token expiration and refresh tokens seamlessly.
- Logout functionality.
- Fully RESTful API for seamless integration with the frontend.

---

## **Tech Stack**

- **Node.js**: Runtime environment.
- **Express.js**: Web framework.
- **MongoDB**: Database for storing user details and tokens.
- **Google APIs Client Library**: For interacting with Google Calendar and OAuth 2.0.

---

### **1. Prerequisites**

Ensure you have the following installed on your machine:

- **Node.js**: Version 14 or above.
- **npm**: Comes with Node.js.
- **MongoDB**: A running instance of MongoDB.
- **Google Cloud Console Project**: Set up for OAuth and Calendar API.

---
