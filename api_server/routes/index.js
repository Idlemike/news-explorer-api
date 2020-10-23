const express = require('express');
const BodyParser = require('body-parser');
const { celebrate, Joi, Segments } = require('celebrate');
const joiObjectId = require('joi-objectid');
const {
  getArticles,
  getArticle,
  postArticle,
  restrictTo,
  deleteArticle,
} = require('../controllers/articleController');
const {
  getUser,
} = require('../controllers/userController');
const { createAccountLimiter } = require('../middlewares/rateLimiter');
const { login, createUser, protect } = require('../controllers/authController');

const router = express.Router();
router.use(BodyParser.urlencoded({ extended: false }));
router.use(BodyParser.json());
Joi.objectId = joiObjectId(Joi);

// SIGNUP. selebrate, Joi
router.post('/signup', createAccountLimiter, celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().alphanum().required().min(2)
      .max(30),
    role: Joi.string().default('user'),
    email: Joi.string().required(),
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9@#$%&]{8,30}$')),
  }),
}), createUser);

// SIGNIN. selebrate, Joi
router.post('/signin', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required().min(8),
  }),
}), login);

router.route('/articles').get(protect, getArticles);

router.get('/articles/:id', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), protect, restrictTo, getArticle);

router.post('/articles', celebrate({
  [Segments.BODY]: Joi.object().keys({
    keyword: Joi.string().required().min(2).max(30),
    title: Joi.string().required().min(2),
    text: Joi.string().required().min(2),
    source: Joi.string().required().min(2),
    date: Joi.date(),
    link: Joi.string().required(),
    image: Joi.string(),
  }),
}), protect, postArticle);

router.get('/users/me', celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required(),
    about: Joi.string().required(),
  }),
}), protect, getUser);

router.delete('/articles/:id', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), protect, restrictTo, deleteArticle);

module.exports = router;
