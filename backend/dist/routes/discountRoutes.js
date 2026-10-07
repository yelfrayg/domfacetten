"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const discountController = require('../controllers/discountController');
router.get('/getDiscount/:code', discountController.getDiscount);
router.post('/createCode', discountController.createCode);
module.exports = router;
