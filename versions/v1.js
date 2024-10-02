const express = require("express");
const router = express.Router();

const transactionRoute = require("../Routes/transactionRoutes");
const bankRoute = require("../Routes/bankRoutes");
const branchRoute = require("../Routes/branchRoutes");
const liabilityRoute = require("../Routes/liabilityRoutes");
const reminderRoute = require("../Routes/reminderRoutes");
const userRoute = require("../Routes/userRoutes");
const eventRoute = require("../Routes/eventRoutes");
const catagoryRoute = require("../Routes/catagoryRoutes");
const particularRoute = require("../Routes/particularRoutes");
const logRoute = require("../Routes/logRoutes");
const universityRoute = require("../Routes/universityRoutes");
const { protect } = require("../Controller/authController");

router.use("/user", userRoute);

router.use("/logs", logRoute);
// router.use(protect);

router.use("/bank", bankRoute);
router.use("/branch", branchRoute);
router.use("/event", eventRoute);
router.use("/catagory", catagoryRoute);
router.use("/particular", particularRoute);

router.use("/transaction", transactionRoute);
router.use("/reminders", reminderRoute);
router.use("/liability", liabilityRoute);
router.use("/university", universityRoute);

module.exports = router;
