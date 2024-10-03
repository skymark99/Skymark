const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { otpToEmail } = require("../Utilities/otpGenerate");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
      maxlength: [20, "User name should be less than 20 characters"],
      minlength: [3, "User name should be greater than 3 characters"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "User must have an email"],
      maxlength: [30, "Email should be less than 30 characters"],
      minlength: [3, "Email should be greater than 3 characters"],
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    phone: {
      type: String,
      unique: true,
      // required: [true, "User must have a phone number"],
      validate: {
        validator: function (value) {
          return value.length >= 10 && value.length <= 13;
        },
        message:
          "Enter a valid phone number with a length between 10 and 13 digits",
      },
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: [8, "Password must have at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["accountant"],
      default: "accountant",
    },
    changePasswordDate: Date,
    passwordResetOtp: String,
    otpExpires: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre("save", async function (next) {
  //check the password is modified or not for when we update
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.changePasswordDate = Date.now();
});

userSchema.methods.checkPassword = async function (
  loginPassword,
  hashedPassword
) {
  return await bcrypt.compare(loginPassword, hashedPassword);
};

// password Reset
userSchema.methods.createPasswordResetOtp = async function (email) {
  const [response, status, otp] = await otpToEmail(email);

  if (status !== "OK" || !otp)
    return next(new AppError("Failed to generate otp please try again..", 500));

  this.passwordResetOtp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
