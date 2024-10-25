const { getTotalBalance } = require("../Aggregation/getBalance");
const Bank = require("../Models/bankModel");
const Branch = require("../Models/branchModel");
const Transaction = require("../Models/transactionModel");
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

  if (!banks.length) {
    return res.status(200).json({
      status: "Success",
      message: "No banks found",
      totalBalance: 0,
      lastMonthBalance: 0,
      percentageHike: "0.00",
      bankBalances: {},
    });
  }

  // Aggregate to get balance for each bank and total balance
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: "$bank",
        balance: {
          $sum: {
            $cond: [
              { $eq: ["$type", "Credit"] },
              { $toDouble: "$amount" },
              { $multiply: [{ $toDouble: "$amount" }, -1] },
            ],
          },
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Debit"] }, { $toDouble: "$amount" }, 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "Credit"] }, { $toDouble: "$amount" }, 0],
          },
        },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  // Create a map of bank balances with additional stats
  const bankBalances = result.reduce((acc, bank) => {
    acc[bank._id] = {
      balance: bank.balance,
      totalDebit: bank.totalDebit,
      totalCredit: bank.totalCredit,
      transactionCount: bank.transactionCount,
    };
    return acc;
  }, {});

  // Calculate total balance across all banks
  const totalBalance = result.reduce((sum, bank) => sum + bank.balance, 0);

  // Get last month's balance
  const lastMonthBalance = banks.reduce(
    (acc, bal) => acc + bal.lastMonthBalance,
    0
  );

  // Calculate percentage hike
  let percentageHike = 0;
  if (lastMonthBalance !== 0) {
    percentageHike =
      ((totalBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100;
  }

  // Add banks that exist in schema but have no transactions
  const bankEnum = ["RBL", "ICICI", "RAK", "HDFC", "CASH", "BANDAN"];
  bankEnum.forEach((bankName) => {
    if (!bankBalances[bankName]) {
      bankBalances[bankName] = {
        balance: 0,
        totalDebit: 0,
        totalCredit: 0,
        transactionCount: 0,
      };
    }
  });

  res.status(200).json({
    status: "Success",
    message: "Successfully fetched bank balances",
    totalBalance,
    lastMonthBalance,
    percentageHike: percentageHike.toFixed(2),
    bankBalances,
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
