const express = require("express");
const {
  getAllBank,
  createBank,
  updateBank,
  getBank,
  deleteBank,
  getBalance,
  bankTransfer,
} = require("../Controller/bankController");
const router = express.Router();

router.post("/bank-transfer", bankTransfer);
router.get("/balance", getBalance);

router.get("/", getAllBank);
router.get("/:id", getBank);
router.post("/", createBank);
router.patch("/:id", updateBank);
router.delete("/:id", deleteBank);

module.exports = router;
