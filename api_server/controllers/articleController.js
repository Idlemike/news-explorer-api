const Article = require('../models/articleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/* CARDS */
exports.getArticles = catchAsync(async (req, res) => {
  const features = new APIFeatures(Article.find({ owner: req.user.id }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const articles = await features.query;
  res.status(200).json({
    // status: 'success',
    requestedAt: req.requestTime,
    data: {
      articles,
    },
    results: articles.length,
  });
});

exports.getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    return next(new AppError('No article found with ID', 404));
  }
  return res.status(200).json({
    // status: 'success',
    requestedAt: req.requestTime,
    data: {
      article,
    },
  });
});

exports.postArticle = catchAsync(async (req, res) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const article = await Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  });
  res.status(201).json({
    // status: 'success',
    requestedAt: req.requestTime,
    data: {
      article,
    },
  });
});

/* exports.deleteArticle = factory.deleteOne(Article); */

exports.restrictTo = catchAsync(async (req, res, next) => {
  const userId = JSON.stringify(req.user._id);
  const article = await
  Article.findById(req.params.id);
  if (!article) {
    return next(new AppError('No article found with ID', 404));
  }
  const cardOwner = `${JSON.stringify(article.owner)}`;

  if (userId !== cardOwner) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  return next();
});

exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndRemove(req.params.id);
  if (!article) {
    return next(new AppError('No article found with that ID', 404));
  }
  return res.status(200).json({
    // status: 'success',
    requestedAt: req.requestTime,
  });
});
