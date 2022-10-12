const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const timeout = require('express-timeout-handler');
const route = require('./routes');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URL, {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to mongoDB');
  })
  .catch((err) => {
    console.log('mongodb error connect: ', err);
  });

mongoose.connection.on('disconnected', (err) => {
  // console.log('mongodb disconnected: ', err);
});

mongoose.connection.on('error', (err) => {
  console.log('mongodb error after connect: ', err);
});

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['ratelimit-reset'],
  }),
);
app.use(cookieParser());

app.use(
  timeout.handler({
    timeout: 10000,
    onTimeout: function (req, res) {
      res.status(504).send('Service unavailable. Please retry.');
    },
  }),
);

app.get('/', (req, res) => {
  const code = req.query.code;
  res.send('HELLO: ' + code);
});
// Apply the rate limiting middleware to API calls only
app.use(apiLimiter);
route(app);

app.listen(PORT, () => {
  console.log('Server is running');
});
