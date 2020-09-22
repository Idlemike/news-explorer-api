const express = require('express');
const { celebrate, Joi } = require('celebrate');
const joiObjectId = require('joi-objectid');
const {
  getUser,
} = require('../controllers/userController');

const router = express.Router();
Joi.objectId = joiObjectId(Joi);

router.get('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    about: Joi.string().required(),
  }),
}), getUser);

module.exports = router;
