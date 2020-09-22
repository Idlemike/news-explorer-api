const Article = require('../models/articleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

/*CARDS*/
exports.getArticles = catchAsync(async (req, res, next) => {
  console.log(req.user.id);
  const features = new APIFeatures(Article.find({ owner: req.user.id }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const articles = await features.query;
  res.status(200).json({
    status: 'success',
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
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      article,
    },
  });
});

exports.postArticle = catchAsync(async (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const article = await Article.create({
    keyword: keyword,
    title: title,
    text: text,
    date: date,
    source: source,
    link: link,
    image: image,
    owner: req.user._id,
  });
  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      article,
    },
  });
});

exports.deleteArticle = factory.deleteOne(Article);

/*exports.deleteCard = catchAsync(async (req, res, next) => {
  const card = await Card.findByIdAndRemove(req.params.id);
  if (!card) {
    return next(new AppError('No card found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
  });
});*/
