const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const timeout = require('express-timeout-handler');
const route = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URL, {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('Connected to mongoDB');
  })
  .catch((err) => {
    // console.log('mongodb error connect: ', err);
  });

mongoose.connection.on('disconnected', (err) => {
  // console.log('mongodb disconnected: ', err);
});

mongoose.connection.on('error', (err) => {
  // console.log('mongodb error after connect: ', err);
});

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use(
  timeout.handler({
    timeout: 5000,
    onTimeout: function (req, res) {
      res.status(503).send('Service unavailable. Please retry.');
    },
  }),
);

app.get('/', (req, res) => {
  const code = req.query.code;
  res.send('HELLO: ' + code);
});

route(app);

app.listen(PORT, () => {
  console.log('Server is running');
});
