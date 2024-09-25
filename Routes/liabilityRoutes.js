const express = require("express");
const {
  getAllLiability,
  getLiability,
  updateLiability,
  createLiability,
  deleteLiability,
  getTotal,
  downloadLiability,
} = require("../Controller/liabilityController");

const router = express.Router();

router.get("/download", downloadLiability);

router.get("/total", getTotal);

router.get("/", getAllLiability);
router.get("/:id", getLiability);
router.post("/", createLiability);
router.patch("/:id", updateLiability);
router.delete("/:id", deleteLiability);

module.exports = router;
