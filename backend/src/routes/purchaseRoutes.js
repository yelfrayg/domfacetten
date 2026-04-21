const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const purchaseController = require('../controllers/purchaseController');

router.post('/newPurchase', purchaseController.createPurchase);
router.post('/savePurchase', purchaseController.savePurchase)

module.exports = router;