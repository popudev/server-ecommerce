const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const route = require('./routes');

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
    console.log(err);
  });

mongoose.connection.on('error', (err) => {
  console.log(err);
});

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  const code = req.query.code;
  res.send('HELLO: ' + code);
});

route(app);

app.listen(PORT, () => {
  console.log('Server is running');
});
