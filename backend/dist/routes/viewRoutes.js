"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = require('path');
const router = express_1.default.Router();
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
    res.render(pathToFile('cart.ejs'), { paypalClientID: process.env.PAYPAL_CLIENT_ID || '' });
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
router.get('/adminauth', (req, res) => {
    res.sendFile(pathToFile('adminAuth.html'));
});
router.get('/adminDashboard', (req, res) => {
    res.sendFile(pathToFile('uploadPanel.html'));
});
module.exports = router;
