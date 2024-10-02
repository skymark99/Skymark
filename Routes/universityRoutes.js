const express = require("express");
const {
  getAllUniv,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} = require("../Controller/universityController");
const router = express.Router();

router.get("/", getAllUniv);
router.get("/:id", getUniversity);
router.post("/", createUniversity);
router.patch("/:id", updateUniversity);
router.delete("/:id", deleteUniversity);

module.exports = router;
