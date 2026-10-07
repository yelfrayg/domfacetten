"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/checkAuth');
router.post('/register', userController.createNewUser);
router.put('/updateUserInfo/:id', userController.updateUserInfo);
router.get('/getUserInfo/:id', verifyToken, userController.getUserData);
router.delete('/deleteUser/:id', userController.deleteUser);
router.post('/login', userController.loginUser);
router.get('/getOrders/:id', userController.fetchOrders);
router.post('/request-otp', userController.requestOTP);
router.post('/verify-otp', userController.verifyOTP);
router.post('/update-password', userController.updatePassword);
module.exports = router;
