const mongoose = require("mongoose");
const { getBranches } = require("../Data/getData");

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      enum: getBranches,
      required: [true, "Branch must have a name"],
    },
    balance: {
      type: Number,
      default: 0,
    },
    RAK: {
      type: Number,
      required: [true, "Need to mention RAK Bank balance"],
    },
    RBL: {
      type: Number,
      required: [true, "Need to mention RBL Bank balance"],
    },
    ICICI: {
      type: Number,
      required: [true, "Need to mention ICICI Bank balance"],
    },
    HDFC: {
      type: Number,
      required: [true, "Need to mention HDFC Bank balance"],
    },
    CASH: {
      type: Number,
      required: [true, "Need to mention CASH balance"],
    },
    BANDAN: {
      type: Number,
      required: [true, "Need to mention BANDAN balance"],
    },
  },
  { timestamps: true }
);

branchSchema.pre("save", function (next) {
  this.balance =
    this.CASH + this.HDFC + this.RBL + this.ICICI + this.RAK + this.BANDAN;
  next();
});

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
