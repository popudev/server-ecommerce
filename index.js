const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const route = require('./routes');
dotenv.config();

const passportSetup = require('./services/passport');
const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URL, {
    autoIndex: true, //make this also true
  })
  .then(() => {
    console.log('Connected to mongoDB');
  });

app.use(
  session({
    secret: 'somethingsecretgoeshere',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

route(app);

app.listen(PORT, () => {
  console.log('Server is running');
});
