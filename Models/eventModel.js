// ... existing code ...
const mongoose = require("mongoose");
const AppError = require("../Utilities/appError");
const { getBranches } = require("../Data/getData");

const eventSchema = mongoose.Schema(
  {
    branchName: {
      type: String,
      enum: getBranches,
      required: [true, "Branch name is required for event"],
    },
    name: {
      type: String,
      required: [true, "Event name is required"],
    },
    amount: {
      type: Number,
      required: [true, "Event amount is required"],
    },
    pastUpdatedAmount: {
      type: Number,
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

eventSchema.virtual("percentageDifference").get(function () {
  const difference = this.amount - this.pastUpdatedAmount;
  const percentageDifference = (difference / this.pastUpdatedAmount) * 100;
  return percentageDifference < 0
    ? `-${Math.abs(percentageDifference).toFixed(2)}%`
    : `+${percentageDifference.toFixed(2)}%`;
});

eventSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());
    const updateData = this.getUpdate();

    if (
      docToUpdate &&
      updateData.amount &&
      docToUpdate.amount !== updateData.amount
    ) {
      this.set({ pastUpdatedAmount: docToUpdate.amount });
    }
    next();
  } catch (error) {
    next(new AppError("Error in finding document", 500));
  }
});

eventSchema.pre("save", function (next) {
  this.pastUpdatedAmount = this.amount;
  next();
});

const Events = mongoose.model("Events", eventSchema);

module.exports = Events;
