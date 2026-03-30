const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.fetchProducts);
router.post('/newProduct', productController.createProduct);

module.exports = router;