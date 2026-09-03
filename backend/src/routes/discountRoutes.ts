import express from 'express';
const router = express.Router();
const discountController = require('../controllers/discountController');

router.get('/getDiscount/:code', discountController.getDiscount);

router.post('/createCode', discountController.createCode);
module.exports = router;
