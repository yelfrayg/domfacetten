const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productImageUpload = require('../middleware/productImageUpload');
const checkAuth = require('../middleware/checkAuth');
router.get('/', productController.fetchProducts);

router.post('/newProduct', productImageUpload.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'secondImage', maxCount: 1 },
    { name: 'thirdImage', maxCount: 1 }
]), productController.createProduct);

router.delete('/deleteProduct', productController.deleteProduct);

router.put('/updateProduct', productController.updateProduct);
module.exports = router;