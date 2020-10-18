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
router.use(BodyParser.json());
Joi.objectId = joiObjectId(Joi);

// SIGNUP. selebrate, Joi
router.post('/signup', createAccountLimiter, celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().alphanum().min(2)
      .max(30),
    role: Joi.string().default('user'),
    email: Joi.string(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9@#$%&]{8,30}$')),
  }),
}), createUser);

// SIGNIN. selebrate, Joi
router.post('/signin', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string(),
    password: Joi.string().min(8),
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
    keyword: Joi.string().min(2).max(30),
    title: Joi.string().min(2).max(30),
    text: Joi.string().min(2),
    source: Joi.string().min(2),
    date: Joi.date(),
    link: Joi.string().pattern(new RegExp('^(https?|HTTPS?):\\/\\/(www.|WWW.)?((([a-zA-Z0-9-]{1,63}\\.){1,256}[a-zA-Z]{2,6})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{2,5})?([-a-zA-Z0-9_\\/.]{0,256}#?)?$')),
    image: Joi.string().pattern(new RegExp('^(https?|HTTPS?):\\/\\/(www.|WWW.)?((([a-zA-Z0-9-]{1,63}\\.){1,256}[a-zA-Z]{2,6})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{2,5})?([-a-zA-Z0-9_\\/.]{0,256}#?)?$')),
  }),
}), protect, postArticle);

router.get('/users/me', celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string(),
    about: Joi.string(),
  }),
}), protect, getUser);

router.delete('/articles/:id', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), protect, restrictTo, deleteArticle);

module.exports = router;
