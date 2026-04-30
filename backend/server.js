require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path');

app.use(express.json());
app.use(cors())

const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

const purchaseRoutes = require('./src/routes/purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);

const userRoutes = require('./src/routes/userRoutes')
app.use('/api/userManagement', userRoutes)

const cartRoutes = require('./src/routes/cartRoutes')
app.use('/api/cartManagement', cartRoutes)

app.use(
  '/uploads/products',
  express.static(path.resolve(__dirname, 'uploads', 'products')),
);

app.get('/', (req, res) => {
  res.send('Willkommen zum Domfacetten Backend!');
})

app.listen(3000, '0.0.0.0', () => {
  console.log('Server läuft auf Port 3000');
});