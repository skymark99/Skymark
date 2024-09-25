const express = require("express");
const {
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  createEvent,
} = require("../Controller/eventController");
const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getEvent);
router.post("/", createEvent);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
