const mongoose = require("mongoose");
const AppError = require("../Utilities/appError");
const Log = require("./logModel");

const catagorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Catagory name is required"],
      minlength: [3, "Catagory name must be at least 3 characters"],
      maxlength: [25, "Catagory name must be at most 25 characters"],
      unique: [true, "Catagory name must be unique"],
    },
    particulars: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Particulars",
      },
    ],
  },
  { timestamps: true }
);

catagorySchema.index({ _id: 1, particulars: 1 }, { unique: true });

catagorySchema.pre("save", function (next) {
  this.name = this.name.trim();
  console.log(this.name);
  next();
});
catagorySchema.pre(/^find/, function (next) {
  if (!this.options.skipParticulars) {
    this.populate("particulars");
  }
  next();
});

const Catagory = mongoose.model("Catagory", catagorySchema);

module.exports = Catagory;
