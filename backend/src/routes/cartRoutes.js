const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController')
const { verifyToken } = require('../middleware/checkAuth');

router.get('/getCartItems/:id', verifyToken, cartController.getCartItems)
router.post('/addCartItems', verifyToken, cartController.addToCart)
router.post('/removeItem', verifyToken, cartController.removeItem)

module.exports = router