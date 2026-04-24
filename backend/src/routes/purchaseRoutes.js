const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const purchaseController = require('../controllers/purchaseController');

router.post('/newPurchase', purchaseController.createPurchase);
router.post('/savePurchase', purchaseController.savePurchase)
router.post('/sendMessage', purchaseController.sendMessage);

module.exports = router;