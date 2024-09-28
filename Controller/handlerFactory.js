const catchAsync = require("../Utilities/catchAsync");
const AppError = require("../Utilities/appError");
const APIFeatures = require("../APIFeatures/APIFeatures");
const Catagory = require("../Models/catagoryModel");
const Particulars = require("../Models/particularsModel");
const Log = require("../Models/logModel");
const { combineDateWithCurrentTime } = require("../Utilities/helper");

const getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    let filter = {};
    const features = new APIFeatures(Model, Model.find(filter), req.query);

    features
      .filter()
      .sort()
      .limitFields()
      .paginate(Model.countDocuments())
      .filterByBranch()
      .filterByDateRange()
      .search();
    // Conditionally apply the category filter
    if (req.query.catagory) {
      try {
        const catagoryDoc = await Catagory.findOne({
          name: req.query.catagory,
        }).select("_id");
        if (catagoryDoc) {
          features.query = features.query.find({ catagory: catagoryDoc._id });
        } else {
          features.query = features.query.find({ _id: { $in: [] } });
        }

        if (req.query.particular) {
          const particular = await Particulars.findOne({
            catagory: catagoryDoc._id,
            name: req.query.particular,
          });
          if (particular) {
            features.query = features.query.find({
              particular: particular._id,
            });
          } else {
            features.query = features.query.find({ _id: { $in: [] } });
          }
        }
      } catch (error) {
        return next(
          new AppError(`Error finding category: ${error.message}`, 400)
        );
      }
    }

    // Execute the query
    const docs = await features.query;

    res.status(200).json({
      message: "Success",
      results: docs.length,
      docs,
    });
  });
};

const getOne = (Model, type = "id") => {
  return catchAsync(async (req, res, next) => {
    let data;

    switch (type) {
      case "id":
        const { id } = req.params;
        data = await Model.findById(id).select("-password");
        break;

      case "email":
        const { email } = req.params;
        data = await Model.findOne({ email }).select("-password");
        break;

      case "phone":
        const { phone } = req.params;
        console.log(phone);
        data = await Model.findOne({ phone }).select("-password");
        break;

      default:
        console.log("it's not going to happen...");
    }

    if (!data) return next(new AppError(`No data on this ${type}`, 404));

    res.status(200).json({
      status: "Success",
      message: "Fetched successfully",
      envelop: {
        data,
      },
    });
  });
};

const createOne = (Model, type) => {
  return catchAsync(async (req, res, next) => {
    const createdData = await Model.create(req.body);
    if (!createdData) return next(new AppError("Error while createing model"));

    // if (Model === Catagory) {
    //   const currentDateAndTime = combineDateWithCurrentTime(new Date());
    //   currentDateAndTime.format("MMMM Do YYYY, h:mm:ss a");

    //   const log = new Log({
    //     log: `${currentDateAndTime.format("MMMM Do YYYY, h:mm a")} ${
    //       req.user.name
    //     } created a new ${Model.modelName} called ${createdData.name} `,
    //     user: req.user._id.toString(),
    //   });
    //   await log.save();
    // }

    res.status(200).json({
      status: "Success",
      message: "Created successfully",
      envelop: {
        data: createdData,
      },
    });
  });
};

const updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updation = req.body;
    const updatedData = await Model.findByIdAndUpdate(id, updation, {
      new: true,
      runValidators: true,
    });

    if (!updatedData) return next(new AppError("Updation failed", 400));

    res.status(200).json({
      status: "Success",
      message: "Successfully Updated",
      envelop: {
        data: updatedData,
      },
    });
  });
};

const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError("No document found with this ID", 400));

    res.status(200).json({
      status: "Success",
      res: doc,
      message: "Deleted Successfully",
    });
  });
};

module.exports = { getAll, getOne, createOne, updateOne, deleteOne };
