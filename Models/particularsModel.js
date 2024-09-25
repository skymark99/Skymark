const mongoose = require("mongoose");

const particularsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is For Particulars"],
      minlength: [3, "Particulars must be at least 3 characters"],
      maxlength: [25, "Particulars must be at most 25 characters"],
    },
    catagory: {
      type: mongoose.Schema.ObjectId,
      ref: "Catagory",
      required: [true, "Particulars must belong to a catagory"],
    },
  },
  { timestamps: true }
);

const Particulars = mongoose.model("Particulars", particularsSchema);

module.exports = Particulars;
