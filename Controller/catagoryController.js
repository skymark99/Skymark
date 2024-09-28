const Catagory = require("../Models/catagoryModel");
const Log = require("../Models/logModel");
const Particulars = require("../Models/particularsModel");
const AppError = require("../Utilities/appError");
const catchAsync = require("../Utilities/catchAsync");
const { combineDateWithCurrentTime } = require("../Utilities/helper");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

const addParticular = catchAsync(async (req, res, next) => {
  const { catagoryName } = req.query;
  const { particular } = req.body;

  if (!catagoryName)
    return next(new AppError("Catagory name is required", 400));

  if (!particular.name)
    return next(new AppError("Particular name is required", 400));

  const catagory = await Catagory.findOne({ name: catagoryName });
  if (!catagory) return next(new AppError("Catagory not found", 404));

  // Check if a particular with the same name already exists in this category
  const existingParticular = await Particulars.findOne({
    name: particular.name,
    catagory: catagory._id,
  });

  if (existingParticular)
    return next(
      new AppError("Particular name must be unique within the category", 400)
    );

  const newParticular = new Particulars({
    name: particular.name,
    catagory: catagory._id,
  });

  catagory.particulars.push(newParticular._id);

  await newParticular.save();
  await catagory.save();

  const currentDateAndTime = combineDateWithCurrentTime(new Date());
  currentDateAndTime.format("MMMM Do YYYY, h:mm:ss a");

  // const log = new Log({
  //   log: `${currentDateAndTime.format("MMMM Do YYYY, h:mm a")} ${
  //     req.user.name
  //   } added a new particular ${
  //     particular.name
  //   } to the ${catagoryName} catagory`,
  //   user: req.user._id,
  // });

  // await log.save();

  res.status(201).json({
    status: "Success",
    message: "Particular added successfully",
    data: newParticular,
  });
});

const updateParticular = catchAsync(async (req, res, next) => {
  const { catagoryName, particularName } = req.query;
  const { particular } = req.body;

  if (!catagoryName)
    return next(new AppError("Catagory name is required", 400));

  if (!particularName || !particular.name)
    return next(
      new AppError("Both old and new particular names are required", 400)
    );

  if (particularName === particular.name)
    return next(new AppError("Nothing to Update", 400));

  const catagory = await Catagory.findOne({ name: catagoryName });
  if (!catagory) return next(new AppError("Catagory not found", 404));

  const updatedParticular = await Particulars.findOneAndUpdate(
    { name: particularName, catagory: catagory._id },
    { $set: { name: particular.name } },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  if (!updatedParticular)
    return next(new AppError("Particular not found", 404));

  const currentDateAndTime = combineDateWithCurrentTime(new Date());
  currentDateAndTime.format("MMMM Do YYYY, h:mm:ss a");

  // const log = new Log({
  //   log: `${currentDateAndTime.format("MMMM Do YYYY, h:mm a")} ${
  //     req.user.name
  //   } updated the particular from ${particularName} to ${
  //     particular.name
  //   } in the ${catagoryName} catagory`,
  //   user: req.user._id,
  // });

  // await log.save();

  res.status(200).json({
    status: "Success",
    message: "Particular updated successfully",
    data: updatedParticular,
  });
});

const deleteParticular = catchAsync(async (req, res, next) => {
  const { catagoryName, particularName } = req.query;

  if (!catagoryName)
    return next(new AppError("Catagory name is required", 400));

  if (!particularName)
    return next(new AppError("Particular name is required", 400));

  const catagory = await Catagory.findOne({ name: catagoryName });
  if (!catagory) return next(new AppError("Catagory not found", 404));

  const particularIndex = catagory.particulars.findIndex(
    (p) => p.name === particularName
  );

  if (particularIndex === -1)
    return next(new AppError("Particular not found", 404));

  catagory.particulars.splice(particularIndex, 1);
  await catagory.save();

  await Particulars.findOneAndDelete({
    name: particularName,
    catagory: catagory._id,
  });

  res.status(200).json({
    status: "Success",
    message: "Particular deleted successfully",
    data: catagory,
  });
});

const getAllCatagory = getAll(Catagory);
const getCatagory = getOne(Catagory);
const createCatagory = createOne(Catagory, "Catagory");
const updateCatagory = updateOne(Catagory, "Catagory");
const deleteCatagory = deleteOne(Catagory);

module.exports = {
  updateParticular,
  deleteParticular,
  addParticular,
  getAllCatagory,
  getCatagory,
  createCatagory,
  updateCatagory,
  deleteCatagory,
};
