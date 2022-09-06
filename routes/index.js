const authRouter = require('./auth');
const cartRouter = require('./cart');
const productRouter = require('./product');
const categoryRouter = require('./category');
const userRouter = require('./user');

function route(app) {
  app.use('/auth', authRouter);
  app.use('/cart', cartRouter);
  app.use('/product', productRouter);
  app.use('/category', categoryRouter);
  app.use('/user', userRouter);
}

module.exports = route;
