"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/checkAuth');
router.post('/createSinglePurchase', verifyToken, purchaseController.createSinglePurchase);
router.post('/completeSinglePurchase', verifyToken, purchaseController.completeSinglePurchase);
router.post('/createCartPurchase', verifyToken, purchaseController.createCartPurchase);
router.post('/completeCartPurchase', verifyToken, purchaseController.completeCartPurchase);
router.get('/getInvoice/:orderId', purchaseController.getInvoice);
module.exports = router;
