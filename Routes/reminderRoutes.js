const express = require("express");
const {
  getAllReminder,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  downloadReminder,
} = require("../Controller/reminderController");
const router = express.Router();

router.get("/download", downloadReminder);

router.get("/", getAllReminder);
router.get("/:id", getReminder);
router.post("/", createReminder);
router.patch("/:id", updateReminder);
router.delete("/:id", deleteReminder);

module.exports = router;
