const APIFeatures = require("../APIFeatures/APIFeatures");
const Bank = require("../Models/bankModel");
const Branch = require("../Models/branchModel");
const Transaction = require("../Models/transactionModel");
const Liability = require("../Models/liabilityModel");
const AppError = require("../Utilities/appError");
const catchAsync = require("../Utilities/catchAsync");

const { getAll, getOne, createOne, deleteOne } = require("./handlerFactory");
const { downloadReport } = require("./Reports/transactionReport");

const downloadTranscation = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return next(new AppError("Please provide start and end date", 400));
  }
  const features = new APIFeatures(
    Transaction,
    Transaction.find({}),
    req.query
  );

  features.filter().sort().filterByBranch().filterByDateRange();

  const transaction = await features.query;

  const filteredTransaction = transaction.map((obj) => {
    const plainObj = obj.toObject();
    plainObj.catagory = plainObj.catagory.name;
    plainObj.particular = plainObj.particular.name;
    delete plainObj.updatedAt;
    delete plainObj.createdAt;
    delete plainObj._id;
    delete plainObj.remark;
    return plainObj;
  });
  if (!transaction) {
    return next(new AppError("Transaction not found", 404));
  }
  downloadReport(filteredTransaction, res, startDate, endDate);
});

const updateTransaction = catchAsync(async (req, res, next) => {
  const { id: transactionId } = req.params;
  const updates = req.body;
  updates._id = transactionId;

  const transaction = new Transaction(updates);
  try {
    await transaction.save();
  } catch (err) {
    await Transaction.create(req.oldTransaction);
  }
  res.status(200).json({
    status: "success",
    message: "Transaction updated successfully",
    transaction,
  });
});

const deleteTransactionByIdMiddleWare = catchAsync(async (req, res, next) => {
  // Fetch the transaction by ID
  const { id: transactionId } = req.params;
  const transaction = await Transaction.findById(transactionId);

  // If the transaction does not exist, return an error
  if (!transaction) {
    return next(new AppError("Transaction not found", 404));
  }

  const { branches, bank: curBank, amount, type } = transaction;

  // Update each branch's balance
  for (let i = 0; i < branches.length; i++) {
    const { amount: branchAmount, branchName } = branches[i];
    const curBranch = await Branch.findOne({ name: branchName });

    if (!curBranch) {
      return next(new AppError(`Branch ${branchName} not found`, 404));
    }

    if (type === "Credit") {
      curBranch[curBank] -= branchAmount;
    } else if (type === "Debit") {
      curBranch[curBank] += branchAmount;
    }

    await curBranch.save();
  }

  // Update bank balance
  const bank = await Bank.findOne({ name: curBank });
  if (!bank) {
    return next(new AppError(`Bank ${curBank} not found`, 404));
  }

  if (type === "Credit") {
    bank.balance -= amount;
    console.log(bank.balance, "bank balance");
  } else if (type === "Debit") {
    bank.balance += amount;
  }

  await bank.save();

  // Delete the transaction after updates are successful
  await Transaction.findByIdAndDelete(transactionId);

  req.params.id = transactionId;
  req.oldTransaction = transaction.toObject();

  next();
});

const deleteManyTransactions = catchAsync(async (req, res, next) => {
  const ids = req.body.ids;

  // Fetch all transactions by IDs
  const transactions = await Promise.all(
    ids.map((id) => Transaction.findById(id))
  );

  // Filter out non-existing transactions
  const validTransactions = transactions.filter((transaction) => transaction);

  // Initialize arrays for batch operations
  const branchUpdates = [];
  const bankUpdates = [];

  for (let i = 0; i < validTransactions.length; i++) {
    const transaction = validTransactions[i];
    const { branches, bank: curBank, amount, type } = transaction;

    // Update each branch's balance
    for (let j = 0; j < branches.length; j++) {
      const { amount: branchAmount, branchName } = branches[j];
      const curBranch = await Branch.findOne({ name: branchName });

      if (!curBranch) {
        return next(new AppError(`Branch ${branchName} not found`, 404));
      }

      if (type === "Credit") {
        if (curBranch[curBank] < branchAmount) {
          return next(
            new AppError(`${branchName}'s balance in ${curBank} is low`, 400)
          );
        }
        curBranch[curBank] -= branchAmount;
      } else {
        curBranch[curBank] += branchAmount;
      }

      branchUpdates.push(curBranch.save()); // Collect branch update promises
    }

    // Update bank balance
    const bank = await Bank.findOne({ name: curBank });
    if (!bank) {
      return next(new AppError(`Bank ${curBank} not found`, 404));
    }

    if (bank.balance < amount) {
      return next(new AppError(`Your ${curBank}'s balance is low`, 400));
    }

    bank.balance -= amount;
    bankUpdates.push(bank.save()); // Collect bank update promises
  }

  // Perform all updates concurrently
  await Promise.all([...branchUpdates, ...bankUpdates]);

  // Delete all transactions after updates are successful
  await Transaction.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    status: "success",
    message: "Transactions deleted successfully",
  });
});

const balanceSheet = catchAsync(async (req, res, next) => {
  // Aggregate income and expenses for each month
  const balanceSheetStats = await Transaction.aggregate([
    {
      // Match transactions that fall within the current year
      $match: {
        date: {
          $gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
          $lte: new Date(new Date().getFullYear(), 11, 31), // End of current year
        },
      },
    },
    {
      // Group transactions by month
      $group: {
        _id: { month: { $month: "$date" } }, // Group by month extracted from date
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0], // Sum amounts where type is Credit
          },
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0], // Sum amounts where type is Debit
          },
        },
      },
    },
    {
      // Project fields for clarity and format
      $project: {
        _id: 0,
        month: "$_id.month",
        income: 1,
        expense: 1,
      },
    },
    {
      // Sort by month to ensure ordered output
      $sort: { month: 1 },
    },
  ]);

  // Calculate total liability and outstanding for each month
  const liabilityStats = await Liability.aggregate([
    {
      // Match liabilities that fall within the current year
      $match: {
        date: {
          $gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
          $lte: new Date(new Date().getFullYear(), 11, 31), // End of current year
        },
      },
    },
    {
      // Group liabilities by month
      $group: {
        _id: { month: { $month: "$date" } }, // Group by month extracted from date
        liability: {
          $sum: {
            $cond: [{ $eq: ["$type", "liability"] }, "$amount", 0], // Sum amounts where type is liability
          },
        },
        outstanding: {
          $sum: {
            $cond: [{ $eq: ["$type", "outstanding"] }, "$amount", 0], // Sum amounts where type is outstanding
          },
        },
      },
    },
    {
      // Project fields for clarity and format
      $project: {
        _id: 0,
        month: "$_id.month",
        liability: 1,
        outstanding: 1,
      },
    },
    {
      // Sort by month to ensure ordered output
      $sort: { month: 1 },
    },
  ]);

  // Initialize all 12 months with zero values
  const allMonths = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
    liability: 0,
    outstanding: 0,
    profit: 0,
  }));

  // Merge the aggregated data into allMonths to ensure all months are included
  const result = allMonths.map((monthData) => {
    const foundMonth = balanceSheetStats.find(
      (data) => data.month === monthData.month
    );
    const foundLiabilityMonth = liabilityStats.find(
      (data) => data.month === monthData.month
    );

    // Calculate income, expense, liability, and outstanding
    const income = foundMonth ? foundMonth.income : 0;
    const expense = foundMonth ? foundMonth.expense : 0;
    const liability = foundLiabilityMonth ? foundLiabilityMonth.liability : 0;
    const outstanding = foundLiabilityMonth
      ? foundLiabilityMonth.outstanding
      : 0;

    // Calculate profit as income - expense
    const profit = income - expense;

    return {
      ...monthData,
      income,
      expense,
      liability,
      outstanding,
      profit,
    };
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formattedResult = result.map((item) => ({
    month: monthNames[item.month - 1],
    income: item.income,
    expense: item.expense,
    liability: item.liability,
    outstanding: item.outstanding,
    profit: item.profit,
  }));

  // Get the current month index (0 = January, 11 = December)
  const currentMonthIndex = new Date().getMonth();

  // Rearrange the months to start with the current month and go backward
  const sortedResult = [
    ...formattedResult.slice(0, currentMonthIndex + 1).reverse(), // From start of the year up to the current month, reversed
    ...formattedResult.slice(currentMonthIndex + 1).reverse(), // From current month onward, reversed
  ];
  res.status(200).json({
    status: "Success",
    message: "Successfully fetched",
    formattedResult: sortedResult,
  });
});

const getAllTransaction = getAll(Transaction);
const getTransaction = getOne(Transaction);
const createTransaction = createOne(Transaction);
// const updateTransaction = updateOne(Transaction);
const deleteTransaction = deleteOne(Transaction);

module.exports = {
  getAllTransaction,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteManyTransactions,
  balanceSheet,
  deleteTransactionByIdMiddleWare,
  downloadTranscation,
};
