const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const catchAsync = require("../Utilities/catchAsync");
const AppError = require("../Utilities/appError");

const KEY = process.env.JWT_SECRET;

const generateToken = (id) => {
  return jwt.sign({ id }, KEY);
};
const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  if (!token) return next(new AppError("Server failed to create token", 500));

  res.cookie("token", token, {
    httpOnly: true,
    // secure: true,
    // sameSite: "none",
  });

  const currentUser = {
    email: user.email,
    phone: user.phone,
    image: user.image,
    name: user.name,
  };

  res.status(statusCode).json({
    status: "Success",
    message: "Successfully logged in",
    envelop: {
      currentUser,
    },
  });
};

const protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check its there
  const token = req.cookies.token;
  if (!token) return next(new AppError("Please Login to get access..", 401));

  // 2) Varify token
  const decode = jwt.verify(token, KEY); // there is a chance to get error

  // 3) Check the user is still exist to make sure
  const currentUser = await User.findById(decode.id);
  if (!currentUser)
    return next(
      new AppError("The User belong to this token is not exist", 401)
    );

  // passing the user  to next middleware
  req.user = currentUser;

  next();
});
const verify = catchAsync(async (req, res, next) => {
  let isLoggedIn = false;
  // 1) Get the token and check its there
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ status: "Failed", message: "Logged in failed", isLoggedIn });

  // 2) Varify token
  const decode = jwt.verify(token, KEY);
  const currentUser = await User.findById(decode.id).select(
    "email phone image name"
  );
  if (!currentUser) {
    return res.status(404).json({
      status: "Failed",
      message: "The User belong to this token is not exist",
      isLoggedIn,
    });
  }

  isLoggedIn = true;
  res.status(200).json({
    status: "Success",
    message: "Successfully Logged in",
    isLoggedIn,
    currentUser,
  });
});
const mails = ["skymarkdubai@gmail.com"];
const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!mails.includes(email)) {
    return next(new AppError("You are not Authorized", 401));
  }

  // Create the user first
  const newUser = await User.create({
    name,
    email,
    password,
    phone,
  });

  // Send the token
  sendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new AppError("User must give email and password to login", 400)
    );

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Unauthorized...", 404));

  //checking password is matching or not
  const isPasswordCorrect = await user.checkPassword(password, user.password);
  if (!isPasswordCorrect) return next(new AppError("Incorrect Password.."));

  // restricting password going to frontend
  user.password = undefined;

  sendToken(user, 200, res);
});

const loginByOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("User must give email to login", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Unauthorized..", 401));

  //checking password is matching or not
  await user.createPasswordResetOtp(email);
  await user.save();

  res
    .status(200)
    .json({ status: "Success", message: "Otp has been sended successfully" });
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError("Something went wrong user not found...", 400));

  if (Date.now() > user.otpExpires) {
    return next(new AppError("This Otp is expired. Try again..", 401));
  }

  if (user.passwordResetOtp != otp)
    return next(new AppError("Incorrect OTP check your inbox again...", 400));

  sendToken(user, 200, res);
});
const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  if (!password) return next(new AppError("Please provide the password", 400));
  const user = await User.findById(req.user._id);
  user.password = password;
  user.save();
  res.status(200).json("Successfully updated password");
});

const logout = catchAsync(async (req, res, next) => {
  // res.clearCookie("token", { path: "/" });
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res
    .status(200)
    .json({ status: "Success", message: "Logged out, cookie cleared" });
});

module.exports = {
  signUp,
  login,
  loginByOtp,
  protect,
  logout,
  verifyOtp,
  verify,
  resetPassword,
};
