"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const withDrawalHelper_1 = __importDefault(require("../utils/withDrawalHelper"));
const errorHelper_1 = require("../utils/errorHelper");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});
async function saveWithdrawalRequest(userId, orderId, reason, withdrawalItems) {
    try {
        console.log("WithdrawalItems:", withdrawalItems);
        console.log("Is array:", Array.isArray(withdrawalItems));
        console.log('Consists only of numbers:', Array.isArray(withdrawalItems) && withdrawalItems.every(item => typeof item === 'number'));
        if (!Array.isArray(withdrawalItems) || !withdrawalItems.every(Number.isInteger)) {
            return {
                code: 400,
                message: "withdrawalItems muss ein Array aus Integern sein",
            };
        }
        const withdrawalRequest = await prisma.withdrawal.create({
            data: {
                userId,
                orderId,
                reason: reason || "Kein Grund angegeben",
                status: withDrawalHelper_1.default.PENDING,
                withDrawalItems: withdrawalItems,
            },
        });
        return {
            code: 200,
            message: withdrawalRequest.status,
        };
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
    }
}
module.exports = { saveWithdrawalRequest };
