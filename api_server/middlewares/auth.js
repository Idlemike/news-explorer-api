const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Article = require('../models/articleModel');

const { JWT_SECRET = 'dev-key' } = process.env;

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
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
  next();
});

exports.restrictTo = catchAsync(async (req, res, next) => {
  const userId = JSON.stringify(req.user._id);
  const article = await
  Article.findById(req.params.id);
  if (!article) {
    return next(new AppError('No article found with ID', 404));
  }
  const cardOwner = `${JSON.stringify(article.owner)}`;
  if (userId !== cardOwner && req.user.role === 'user') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  return next();
});
