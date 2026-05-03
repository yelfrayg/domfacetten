const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/checkAuth');

router.post('/newPurchase', purchaseController.createPurchase);
router.post('/createCartPurchase', verifyToken, purchaseController.createCartPurchase);
router.post('/completeCartPurchase', verifyToken, purchaseController.completeCartPurchase);
// router.post('/savePurchase', purchaseController.savePurchase)
// router.post('/sendMessage', purchaseController.sendMessage);


module.exports = router;