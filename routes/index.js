const authRouter = require('./auth');
const cartRouter = require('./cart');
const productRouter = require('./product');
const categoryRouter = require('./category');

function route(app) {
  app.use('/auth', authRouter);
  app.use('/cart', cartRouter);
  app.use('/product', productRouter);
  app.use('/category', categoryRouter);
}

module.exports = route;
