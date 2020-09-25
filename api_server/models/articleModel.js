const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const userModel = require('./usersModel');

const urlValidator = [
  validate({
    validator: 'isURL',
    protocols: ['http', 'https', 'ftp'],
    require_tld: true,
    require_protocol: true,
    message: 'Must be a Valid URL',
  }),
];

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An article must have a title'],
    maxlength: [30, 'An article title must have less or equal then 30 characters'],
    minlength: [2, 'An article title must have more or equal then 2 characters'],
  },
  keyword: {
    type: String,
    required: [true, 'An article must have a keyword'],
    maxlength: [30, 'An article keyword must have less or equal then 30 characters'],
    minlength: [2, 'An article keyword must have more or equal then 2 characters'],
  },
  text: {
    type: String,
    required: [true, 'An article must have a text'],
    minlength: [2, 'An article text must have more or equal then 2 characters'],
  },
  source: {
    type: String,
    required: [true, 'An article must have a source'],
    minlength: [2, 'An article text must have more or equal then 2 characters'],
  },
  date: {
    type: Date,
    default: Date.now(),
    // select: false
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: userModel,
    required: [true, 'An owner is required'],
  },
  link: {
    type: String,
    trim: true,
    lowercase: true,
    validate: urlValidator,
    required: [true, 'A link to article is necessary'],
  },
  image: {
    type: String,
    trim: true,
    lowercase: true,
    validate: urlValidator,
    required: [true, 'A link to image is necessary'],
  },
});

module.exports = mongoose.model('article', articleSchema);
