const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app"); // Ensure that app is properly exported in 'app.js'

const Db = process.env.CONNECTION_STR; // Ensure the environment variable is correctly set

mongoose
  .connect(Db)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Error connecting to database:", err)); // Changed to console.error for better visibility

// Improved error handling for server start
app.listen(3000, (err) => {
  if (err) {
    console.error("Error starting the server:", err); // Better error handling
  } else {
    console.log("Server is running on port 3000");
  }
});
