const authRouter = require('./auth');
const cartRouter = require('./cart');
const productRouter = require('./product');
const categoryRouter = require('./category');
const userRouter = require('./user');
const addressRouter = require('./address');
const orderRouter = require('./order');

function route(app) {
  app.use('/auth', authRouter);
  app.use('/cart', cartRouter);
  app.use('/product', productRouter);
  app.use('/category', categoryRouter);
  app.use('/user', userRouter);
  app.use('/address', addressRouter);
  app.use('/order', orderRouter);
}

module.exports = route;
