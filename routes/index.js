const authRouter = require('./auth');
const cartRouter = require('./cart');

function route(app) {
  app.use('/auth', authRouter);
  app.use('/cart', cartRouter);
}

module.exports = route;
