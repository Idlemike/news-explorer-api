const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoConf = require('../utils/mongoconfig');

const { JWT_SECRET = mongoConf.JWT_SECRET} = process.env;
const { JWT_EXPIRES_IN = mongoConf.JWT_EXPIRES_IN } = process.env;
const { JWT_COOKIE_EXPIRES_IN = mongoConf.JWT_COOKIE_EXPIRES_IN } = process.env;

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN,
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer')) {
      [, token] = req.headers.authorization.split(' ');
    }
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist', 401));
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! please log in again.', 401));
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  return next();
});

const createSendToken = (user, statusCode, res) => {
  const userDev = user;
  const token = signToken(userDev._id);

  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  userDev.password = undefined;

  res.status(statusCode).json({
    // status: 'success',
    data: {
      userDev,
    },
  });
};

exports.createUser = catchAsync(async (req, res, next) => {
  let { password } = req.body;
  password = password.match(/(\S){8,20}/);
  if (!password) {
    return next(new AppError('Please provide password! It should contain from 8 digits and letters and symbols @#$%', 400));
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });
  return createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  return createSendToken(user, 201, res);
});
