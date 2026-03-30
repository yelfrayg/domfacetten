require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path');

app.use(express.json());
app.use(cors())

const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

app.use(
  '/uploads/products',
  express.static(path.resolve(__dirname, 'uploads', 'products')),
);

app.get('/', (req, res) => {
  res.send('Willkommen zum Domfacetten Backend!');
})

app.listen(3000, () => {
  console.log('Server läuft auf Port 3000');
});