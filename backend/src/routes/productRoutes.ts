import express from 'express';
const router = express.Router();
const productController = require('../controllers/productController');
const productImageUpload = require('../middleware/productImageUpload');

router.get('/', productController.fetchProducts);

router.get('/:artnr', productController.fetchProductByArtNr);

router.post('/newProduct', productImageUpload.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'secondImage', maxCount: 1 },
    { name: 'thirdImage', maxCount: 1 }
]), productController.createProduct);

router.delete('/deleteProduct', productController.deleteProduct);

router.put('/updateProduct', productController.updateProduct);
module.exports = router;