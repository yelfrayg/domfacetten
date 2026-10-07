"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withdrawalService = require("../services/withdrawalService.ts");
const errorHelper_1 = require("../utils/errorHelper");
async function createWithdrawalRequest(req, res) {
    try {
        const { userId, orderId, amount, withdrawalItem } = req.body;
        const newWithdrawal = await withdrawalService.saveWithdrawalRequest(userId, orderId, amount, withdrawalItem);
        const response = {
            status: newWithdrawal.code === 200 ? "SUCCESS" : "FAILURE",
            message: newWithdrawal.message,
        };
        res.status(newWithdrawal.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
module.exports = {
    createWithdrawalRequest,
};
