const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const route = require('./routes');
const passportConfig = require('./services/passportConfig');

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
  });

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use(
  session({
    secret: 'somethingsecretgoeshere',
    resave: false,
    saveUninitialized: true,
    cookie: { 
sameSite: 'none',
secure: true },
  }),
);

app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport);
route(app);

app.listen(PORT, () => {
  console.log('Server is running');
});
