require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path');

app.use(express.json());
app.use(cors())

app.use(express.static(path.resolve(__dirname, 'public')));

const viewRoutes = require('./src/routes/viewRoutes');
app.use('/', viewRoutes);

const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

const purchaseRoutes = require('./src/routes/purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);

const userRoutes = require('./src/routes/userRoutes')
app.use('/api/userManagement', userRoutes)

const cartRoutes = require('./src/routes/cartRoutes')
app.use('/api/cartManagement', cartRoutes)

const discountRoutes = require('./src/routes/discountRoutes')
app.use('/api/discountManagement', discountRoutes)

app.use(
  '/uploads/products',
  express.static(path.resolve(__dirname, 'uploads', 'products')),
);


app.listen(3000, '0.0.0.0', () => {
  console.log('Server läuft auf Port 3000');
});

// Fehlerbehandlung für unerwartete Fehler
process.on('uncaughtException', (error) => {
  console.error('Unerwarteter Fehler:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unbehandelte Promise Rejection:', reason);
});