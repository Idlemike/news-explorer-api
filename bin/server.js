const mongoose = require('mongoose');
const dotenv = require('dotenv');
const mongoConf = require('../api_server/utils/mongoconfig');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('../app');

const { DB = mongoConf.DB } = process.env;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    /* console.log(con.connections); */
    console.log('DB connection successful!');
  })
  .catch((err) => { throw err; });
const { PORT = mongoConf.PORT } = process.env;
const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  server.close(() => {
    console.log('Http server closed.');
    // boolean means [force], see in mongoose doc
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed.');
      process.exit(0);
    });
  });
});
