const Reminder = require("../Models/remindersModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

const { reminderReport } = require("./Reports/reminderReport");
const catchAsync = require("../Utilities/catchAsync");
const AppError = require("../Utilities/appError");
const APIFeatures = require("../APIFeatures/APIFeatures");

const downloadReminder = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError("Please provide start and end dates", 400));
  }
  const features = new APIFeatures(Reminder, Reminder.find({}), req.query);

  features.filter().sort().filterByBranch().filterByDateRange();

  const reminders = await features.query;

  const filteredReminders = reminders.map((obj) => {
    const plainObj = obj.toObject();
    plainObj.catagory = plainObj.catagory.name;
    plainObj.particular = plainObj.particular.name;
    plainObj.branch = plainObj.branchName;
    delete plainObj.updatedAt;
    delete plainObj.createdAt;
    delete plainObj._id;
    delete plainObj.remark;
    return plainObj;
  });

  reminderReport(filteredReminders, res, startDate, endDate);
});

module.exports = { downloadReminder };

const getAllReminder = getAll(Reminder);
const getReminder = getOne(Reminder);
const createReminder = createOne(Reminder);
const updateReminder = updateOne(Reminder);
const deleteReminder = deleteOne(Reminder);

module.exports = {
  getAllReminder,
  getReminder,
  createReminder,
  updateReminder,
  downloadReminder,
  deleteReminder,
};
