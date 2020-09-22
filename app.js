const express = require('express');
const BodyParser = require('body-parser');
const {
  celebrate, Joi, errors,
} = require('celebrate');
const joiObjectId = require('joi-objectid');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./api_server/utils/appError');
const globalErrorHandler = require('./api_server/controllers/errorController');
const userRouter = require('./api_server/routes/userRoutes');
const articleRouter = require('./api_server/routes/articleRoutes');
const { login, createUser } = require('./api_server/controllers/authController');
const { requestLogger, errorLogger } = require('./api_server/middlewares/logger');

const auth = require('./api_server/middlewares/auth');

const app = express();
app.use(BodyParser.json());
// add joi-objectId to Joi
Joi.objectId = joiObjectId(Joi);

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitation against No SQL query injection
app.use(mongoSanitize());
// Data sanitation against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['name', 'createdAt'],
}));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use(requestLogger); // подключаем логгер запросов

// test crash
/*app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});*/

// SIGNUP. selebrate, Joi
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().alphanum().required().min(2)
      .max(30),
    role: Joi.string().default('user'),
    email: Joi.string().required().email(),
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9@#$%&]{8,30}$')),
  }),
}), createUser);

// SIGNIN. selebrate, Joi
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

// требуем поле авторизации для всех запросов, кроме signin signup
app.use(celebrate({
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(),
}));

// 3) ROUTES
// USERS

app.use('/users', auth.protect, userRouter);

// ARTICLES

app.use('/articles', auth.protect, articleRouter);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
