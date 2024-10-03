const mongoose = require("mongoose");
const { combineDateWithCurrentTime } = require("../Utilities/helper");

const universitySchema = mongoose.Schema(
  {
    date: {
      type: Date,
      default: new Date(),
    },
    student: {
      type: String,
      required: [true, "University Data must have student name"],
    },
    branchName: {
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

    formattedDate: {
      type: String,
    },
    counsillor: {
      type: String,
      required: [true, "University Data must have a counsellor"],
    },
    country: {
      type: String,
      required: [true, "University Data must have a Country"],
    },
    intakeMonth: {
      type: String,
      required: [true, "University Data must have an intake month"],
    },
    intake: {
      type: String,
      required: [true, "University must have an intake"],
      enum: ["April-October", "November-March"],
    },
    university: {
      type: String,
      required: [true, "University must have a name"],
    },
    courseFee: {
      type: Number,
      required: [true, "University must have a course fee"],
    },
    commition: {
      type: Number,
      required: [true, "University must have a commition"],
    },
    status: {
      type: String,
      required: [true, "University must have a status"],
      enum: ["Invoice Shared", "Mail Pending", "Pending", "Received"],
    },
    agent: {
      type: String,
      required: [true, "University Must have an agent name"],
    },
    currency: {
      type: String,
      enum: ["USD", "Pound", "CAD", "Euro"],
      required: [true, "Commition must have a currency"],
    },
    inr: {
      type: Number,
      required: [true, "Must need INR"],
    },
  },
  { timestamps: true }
);

universitySchema.pre("save", async function (next) {
  const combinedDateTime = combineDateWithCurrentTime(this.date);

  this.date = combinedDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  this.formattedDate = combinedDateTime.format("YYYY-MM-DD");

  next();
});

universitySchema.pre("findOneAndUpdate", async function (next) {
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

const University = mongoose.model("University", universitySchema);

module.exports = University;
