const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/checkAuth');

router.post('/createSinglePurchase', verifyToken, purchaseController.createSinglePurchase);
router.post('/completeSinglePurchase', verifyToken, purchaseController.completeSinglePurchase);
router.post('/createCartPurchase', verifyToken, purchaseController.createCartPurchase);
router.post('/completeCartPurchase', verifyToken, purchaseController.completeCartPurchase);



module.exports = router;