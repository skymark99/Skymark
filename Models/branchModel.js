const mongoose = require("mongoose");

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      enum: [
        "Kozhikode",
        "Kottayam",
        "Kochi",
        "Manjeri",
        "Kannur",
        "Directors",
        "Corporate",
      ],
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
  this.balance = this.CASH + this.HDFC + this.RBL + this.ICICI + this.RAK;
  next();
});

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
