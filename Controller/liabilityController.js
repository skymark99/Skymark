const APIFeatures = require("../APIFeatures/APIFeatures");
const Liablity = require("../Models/liabilityModel");
const AppError = require("../Utilities/appError");
const catchAsync = require("../Utilities/catchAsync");
const { currentDateFormatter } = require("../Utilities/helper");
const {
  getAll,
  getOne,
  updateOne,
  createOne,
  deleteOne,
} = require("./handlerFactory");
const { liablityReport } = require("./Reports/liabilityReport");

const downloadLiability = catchAsync(async (req, res, next) => {
  const { type } = req.query;
  const text = type === "liability" ? "Liability" : "Outstanding";
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return next(new AppError("Please provide start and end date", 400));
  }
  const features = new APIFeatures(Liablity, Liablity.find({}), req.query);

  features.filter().sort().filterByBranch().filterByDateRange();

  const liability = await features.query;

  const filteredLiability = liability.map((obj) => {
    const plainObj = obj.toObject();
    plainObj.catagory = plainObj.catagory.name;
    plainObj.particular = plainObj.particular.name;
    delete plainObj.updatedAt;
    delete plainObj.createdAt;
    delete plainObj._id;
    delete plainObj.remark;
    return plainObj;
  });
  if (!liability) {
    return next(new AppError("Liability not found", 404));
  }
  liablityReport(filteredLiability, res, startDate, endDate, text);
});

const getTotal = catchAsync(async (req, res, next) => {
  const statsArr = await Liablity.aggregate([
    {
      $group: {
        _id: null, // Required to use _id, set to null if not grouping by a field
        totalOutstanding: {
          $sum: {
            $cond: [{ $eq: ["$type", "outstanding"] }, "$amount", 0], // Sum amounts where type is outstanding
          },
        },
        totalLiability: {
          $sum: {
            $cond: [{ $eq: ["$type", "liability"] }, "$amount", 0], // Sum amounts where type is liability
          },
        },
      },
    },
  ]);
  const stats = statsArr[0] || {};

  res.status(200).json({
    status: "Success",
    message: "Successfully fetched the total details",
    liability: stats?.totalLiability,
    outstanding: stats?.totalOutstanding,
  });
});

const getAllLiability = getAll(Liablity);
const getLiability = getOne(Liablity);
const updateLiability = updateOne(Liablity);
const createLiability = createOne(Liablity);
const deleteLiability = deleteOne(Liablity);

module.exports = {
  getAllLiability,
  getLiability,
  updateLiability,
  createLiability,
  deleteLiability,
  getTotal,
  downloadLiability,
};
