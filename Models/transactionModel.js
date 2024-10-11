const mongoose = require("mongoose");
const Bank = require("./bankModel");
const Branch = require("./branchModel");
const AppError = require("../Utilities/appError");

const { combineDateWithCurrentTime } = require("../Utilities/helper");
const Catagory = require("./catagoryModel");
const Particulars = require("./particularsModel");

const transactionShema = mongoose.Schema(
  {
    catagory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Catagory",
      required: [true, "Transaction Must have a Catagory"],
    },

    particular: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Particulars",
      required: [true, "Transaction Must have a Particular"],
    },

    purpose: {
      type: String,
      required: [true, "Transaction Must hava a purpose"],
      minlength: [3, "Branch name must be at least 3 characters long"],
      maxlength: [30, "Branch name must be less than 50 characters long"],
    },
    amount: {
      type: Number,
      required: [true, "Transaction must have an amount"],
      min: [0, "Balance is very law can't make this transaction"],
    },
    bank: {
      type: String,
      enum: ["RBL", "ICICI", "RAK", "HDFC", "CASH", "BANDAN"],
      required: [true, "Bank must have a name"],
    },

    remark: {
      type: String,
      trim: true,
      minlength: [3, "Description must be at least 3 characters long"],
    },

    type: {
      type: String,
      enum: ["Credit", "Debit"],
      required: [true, "Transaction must have a type (Credit or Debit)"],
    },

    date: {
      type: Date,
      default: new Date(),
    },
    formattedDate: {
      type: String,
    },
    branches: [
      {
        amount: {
          type: Number,
          required: [true, "Branch amount must be specified"],
          min: [0, "Amount must be a positive number"],
        },
        branchName: {
          type: String,
          enum: [
            "Kozhikode",
            "Kottayam",
            "Kochi",
            "Manjeri",
            "Kannur",
            "Corporate",
            "Directors",
          ],
          required: [true, "Branch must have a name"],
        },
      },
    ],
  },
  { timestamps: true }
);

transactionShema.pre(/^find/, function (next) {
  this.populate({
    path: "particular",
    select: "name",
  });
  next();
});

transactionShema.pre("save", async function (next) {
  const bank = await Bank.findOne({ name: this.bank });
  if (!bank) return next(new AppError("Unable to fetch bank details", 404));

  this.amount = this.branches.reduce((acc, branch) => acc + branch.amount, 0);

  this.branches.forEach(async (details) => {
    const branch = await Branch.findOne({ name: details.branchName });
    if (!branch) return next(new AppError("Unable to fetch bank details", 404));

    if (this.type === "Credit") {
      branch[this.bank] += details.amount;
    } else if (this.type === "Debit") {
      branch[this.bank] -= details.amount;
    }
    await branch.save();
  });

  if (this.type === "Credit") {
    bank.balance += parseInt(this.amount);
  } else if (this.type === "Debit") {
    bank.balance -= parseInt(this.amount);
  }
  await bank.save();
});

transactionShema.pre("save", async function (next) {
  const combinedDateTime = combineDateWithCurrentTime(this.date);

  this.date = combinedDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  this.formattedDate = combinedDateTime.format("YYYY-MM-DD");

  next();
});

transactionShema.pre("findOneAndUpdate", async function (next) {
  // Get the update object
  const update = this.getUpdate();

  // Check if the 'date' field exists in the update object
  if (update.date) {
    // Combine date with the current time
    const combinedDateTime = combineDateWithCurrentTime(update.date);

    // Update the date fields
    update.date = combinedDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    update.formattedDate = combinedDateTime.format("YYYY-MM-DD");
  }

  next();
});

const Transaction = mongoose.model("Transaction", transactionShema);

module.exports = Transaction;
