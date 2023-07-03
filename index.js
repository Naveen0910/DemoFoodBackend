import express from 'express';
import mongoose from 'mongoose';
import productRoutes from './routes/products.js';

const url = 'mongodb://localhost/FS2';

const app = express();

mongoose.connect(url, { useNewUrlParser: true });
const con = mongoose.connection;

con.on('open', () => {
  console.log('connected...');
});

app.use(express.json());

// const productRouter = require('./routes/products')
app.use('/products', productRoutes);

app.listen(9000, () => {
  console.log('Server started');
});
