const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app");

const Db = process.env.CONNECTION_STR;

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to MongoDB
mongoose
  .connect(Db)
  .then(() => console.log("Connected to Database"))
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1); // Exit if the database connection fails
  });

// Improved error handling for server start
const PORT = process.env.PORT || 3000; // Use environment variable for port
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting the server:", err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});

// Handling unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
