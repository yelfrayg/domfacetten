const express = require('express');
const app = express();
app.use(express.json());

const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('Willkommen zum Domfacetten Backend!');
})

app.listen(3000, () => {
  console.log('Server läuft auf Port 3000');
});