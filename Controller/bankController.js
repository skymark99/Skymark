const Bank = require("../Models/bankModel");

const catchAsync = require("../Utilities/catchAsync");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

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
};
