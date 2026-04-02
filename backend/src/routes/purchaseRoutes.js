const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const purchaseController = require('../controllers/purchaseController');

router.post('/newPurchase', purchaseController.createPurchase);

module.exports = router;