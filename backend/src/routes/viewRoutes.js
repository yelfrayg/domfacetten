const express = require('express');
const path = require('path');
const router = express.Router();

function pathToFile(fileName) {
    return path.resolve(__dirname, '..', '..', 'public', fileName);
}

router.get('/', (req, res) => {
    res.sendFile(pathToFile('index.html'));
});

router.get('/products', (req, res) => {
    res.sendFile(pathToFile('productPage.html'));
});

router.get('/cart', (req, res) => {
    res.render(pathToFile('cart.ejs'), { paypalClientID: process.env.PAYPAL_CLIENT_ID || ''});
});

router.get('/product/:id', (req, res) => {
    res.sendFile(pathToFile('product.html'));
});

router.get('/userAuth', (req, res) => {
    res.sendFile(pathToFile('userAuth.html'));
});

router.get('/dashboard/:id', (req, res) => {
    res.sendFile(pathToFile('dashboard.html'));
});

router.get('/places', (req, res) => {
    res.sendFile(pathToFile('places.html'));
});

module.exports = router;