const express = require('express');
const { celebrate, Joi } = require('celebrate');
const joiObjectId = require('joi-objectid');
const {
  getArticles,
  getArticle,
  postArticle,
  deleteArticle,
} = require('../controllers/articleController');
const auth = require('../middlewares/auth');

const router = express.Router();
Joi.objectId = joiObjectId(Joi);

router.route('/').get(getArticles);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), auth.restrictTo, getArticle);

router.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required().min(2).max(30),
    title: Joi.string().required().min(2).max(30),
    text: Joi.string().required().min(2),
    name: Joi.string().required().min(2).max(30),
    source: Joi.string().required().min(2),
    date: Joi.date(),
    link: Joi.string().required().pattern(new RegExp('^(https?|HTTPS?):\\/\\/(www.|WWW.)?((([a-zA-Z0-9-]{1,63}\\.){1,256}[a-zA-Z]{2,6})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{2,5})?([-a-zA-Z0-9_\\/.]{0,256}#?)?$')),
    image: Joi.string().required().pattern(new RegExp('^(https?|HTTPS?):\\/\\/(www.|WWW.)?((([a-zA-Z0-9-]{1,63}\\.){1,256}[a-zA-Z]{2,6})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{2,5})?([-a-zA-Z0-9_\\/.]{0,256}#?)?$')),
  }),
}), postArticle);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), auth.restrictTo, deleteArticle);

module.exports = router;
