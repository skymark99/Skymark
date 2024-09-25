const express = require("express");
const {
  getAllBranch,
  createBranch,
  updateBranch,
  getBranch,
  deleteBranch,
  monthWiseBranchPnl,
  yearlyPnl,
  allMonthBranchPnl,
} = require("../Controller/branchController");
const router = express.Router();

router.get("/month-wise-pnl", monthWiseBranchPnl);
router.get("/all-month-pnl", allMonthBranchPnl);
+``;
router.get("/yearly-pnl", yearlyPnl);

router.get("/", getAllBranch);
router.get("/:id", getBranch);
router.post("/", createBranch);
router.patch("/:id", updateBranch);
router.delete("/:id", deleteBranch);

module.exports = router;
