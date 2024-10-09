const mongoose = require("mongoose");
const { combineDateWithCurrentTime } = require("../Utilities/helper");

const liabilitySchema = mongoose.Schema(
  {
    catagory: {
      type: mongoose.Schema.ObjectId,
      ref: "Catagory",
      required: [true, "Liability Must have a Catagory"],
    },

    particular: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Particulars",
      required: [true, "Transaction Must have a Particular"],
    },
    type: {
      type: String,
      enum: ["liability", "outstanding"],
      required: [
        true,
        "Entry type must be either 'liability' or 'outstanding'",
      ],
    },

    purpose: {
      type: String,
      required: [true, "Transaction must have a purpose"],
      minlength: [3, "Purpose must be at least 3 characters long"],
      maxlength: [60, "Purpose must be less than 20 characters long"],
    },

    amount: {
      type: Number,
      required: [true, "Transaction must have an amount"],
      min: [0, "Amount must be a positive number"],
    },

    remark: {
      type: String,
      trim: true,
      minlength: [3, "Remark must be at least 3 characters long"],
    },

    status: {
      type: String,
      enum: ["Paid", "Unpaid", "Postponed", "Pending"],
      required: [
        true,
        "Liability/Outstanding must have a status ('Paid', 'Unpaid', 'Postponed', or 'Pending')",
      ],
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
    formattedDate: {
      type: String,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
liabilitySchema.pre(/^find/, function (next) {
  this.populate({
    path: "particular",
    select: "name",
  });
  next();
});

liabilitySchema.pre("save", function (next) {
  const combinedDateTime = combineDateWithCurrentTime(this.date);
  this.date = combinedDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  this.formattedDate = combinedDateTime.format("YYYY-MM-DD");

  next();
});
liabilitySchema.pre("findOneAndUpdate", async function (next) {
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

const Liablity = mongoose.model("Liability and outstanding", liabilitySchema);

module.exports = Liablity;
