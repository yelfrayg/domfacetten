import express from 'express';
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { verifyToken } = require('../middleware/checkAuth');

router.post('/createWithdrawalRequest', verifyToken, withdrawalController.createWithdrawalRequest);

module.exports = router;