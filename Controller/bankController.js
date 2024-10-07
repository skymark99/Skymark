const Bank = require("../Models/bankModel");
const AppError = require("../Utilities/appError");

const catchAsync = require("../Utilities/catchAsync");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

const bankTransfer = catchAsync(async (req, res, next) => {
  const { from, to, amount } = req.body;

  const fromBank = await Bank.findOne({ name: from });
  const toBank = await Bank.findOne({ name: to });

  if (!fromBank || !toBank) return next(new AppError("Invalid banks..."));

  let amt;

  if (Number(amount)) {
    amt = Number(amount);
  } else {
    return next(new AppError("Invalid Number"));
  }

  fromBank.balance -= amt;
  toBank.balance += amt;

  await fromBank.save();
  await toBank.save();

  res
    .status(200)
    .json({ status: "Success", message: "Successfully updated banks" });
});

const getBalance = catchAsync(async (req, res, next) => {
  const banks = await Bank.find({});

  const totalBalance = banks.reduce((acc, bal) => acc + bal.balance, 0);
  const lastMonthBalance = banks.reduce(
    (acc, bal) => acc + bal.lastMonthBalance,
    0
  );

  // Calculate percentage hike from last month's balance
  let percentageHike = 0;
  if (lastMonthBalance > 0) {
    percentageHike =
      ((totalBalance - lastMonthBalance) / lastMonthBalance) * 100;
  }

  res.status(200).json({
    status: "Success",
    message: "Successfully fetched bank balance",
    totalBalance,
    lastMonthBalance,
    percentageHike: percentageHike.toFixed(2),
  });
});

const getAllBank = getAll(Bank);
const getBank = getOne(Bank);
const createBank = createOne(Bank);
const updateBank = updateOne(Bank);
const deleteBank = deleteOne(Bank);

module.exports = {
  getAllBank,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  getBalance,
  bankTransfer,
};
