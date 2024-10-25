const Transaction = require("../Models/transactionModel");

const getTotalBalance = async (bank, branch) => {
  const matchStage = { bank, branch };

  const result = await Transaction.aggregate([
    { $match: { bank, "branches.branchName": branch } },
    {
      $group: {
        _id: null,
        totalBalance: {
          $sum: {
            $cond: [
              { $eq: ["$type", "Credit"] },
              { $toDouble: "$amount" }, // If Credit, add amount
              { $multiply: [{ $toDouble: "$amount" }, -1] }, // If Debit, subtract amount
            ],
          },
        },
      },
    },
  ]);

  return result.length ? result[0].totalBalance : 0; // Handle case when result is empty
};

module.exports = { getTotalBalance };
