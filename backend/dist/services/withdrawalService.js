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
async function saveWithdrawalRequest(userId, orderId, amount, withdrawalItem) {
    try {
        const withdrawalRequest = await prisma.withdrawal.create({
            data: {
                orderId,
                userId,
                amount,
                status: withDrawalHelper_1.default.PENDING,
                withDrawalItem: JSON.stringify({ ...withdrawalItem }), // Store the withdrawal item as a JSON string
            },
        });
        return {
            code: 200,
            message: `Withdrawal request saved successfully. STATUS: ${withdrawalRequest.status}`,
        };
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
    }
}
