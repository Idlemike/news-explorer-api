const userModel = require('../models/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/*USERS ID*/

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.patchUser = catchAsync(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(req.user._id, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

