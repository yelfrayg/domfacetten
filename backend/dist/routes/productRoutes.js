"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
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
