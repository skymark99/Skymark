const express = require("express");
const {
  getAllTransaction,
  createTransaction,
  updateTransaction,
  getTransaction,
  deleteTransaction,
  deleteManyTransactions,
  balanceSheet,
  deleteTransactionByIdMiddleWare,
  downloadTranscation,
} = require("../Controller/transactionController");
const router = express.Router();

router.delete("/delete-transactions", deleteManyTransactions);
router.get("/balance-sheet", balanceSheet);
router.get("/download", downloadTranscation);

router.get("/", getAllTransaction);
router.get("/:id", getTransaction);
router.post("/", createTransaction);
router.patch("/:id", deleteTransactionByIdMiddleWare, updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
