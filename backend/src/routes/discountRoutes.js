const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

router.get('/getDiscount/:code', discountController.getDiscount);

module.exports = router;
