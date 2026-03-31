const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productImageUpload = require('../middleware/productImageUpload');

router.get('/', productController.fetchProducts);

router.post('/newProduct', productImageUpload.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'secondImage', maxCount: 1 },
    { name: 'thirdImage', maxCount: 1 }
]), productController.createProduct);

module.exports = router;