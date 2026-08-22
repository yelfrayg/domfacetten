"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/checkAuth');
router.get('/getCartItems/:id', verifyToken, cartController.getCartItems);
router.post('/addCartItems', verifyToken, cartController.addToCart);
router.delete('/removeItem', verifyToken, cartController.removeItem);
router.post('/findItem', verifyToken, cartController.findItemInCart);
router.put('/updateAmount', verifyToken, cartController.updateAmount);
module.exports = router;
