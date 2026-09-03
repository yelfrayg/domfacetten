import express from 'express';
const router = express.Router();
const adminController = require('../controllers/adminController')

router.post('/verifyCode', adminController.verifyCode)

module.exports = router