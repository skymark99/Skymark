const { default: mongoose } = require("mongoose");
const { combineDateWithCurrentTime } = require("../Utilities/helper");

const logSchema = mongoose.Schema({
  log: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  formattedDate: {
    type: String,
  },
});

logSchema.pre("save", function (next) {
  const combinedDateTime = combineDateWithCurrentTime(this.date);
  this.date = combinedDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  this.formattedDate = combinedDateTime.format("YYYY-MM-DD");
  next();
});

logSchema.pre("save", function (next) {
  this.createdAt = new Date();
  next();
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
