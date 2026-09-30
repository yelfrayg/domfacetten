import { PrismaClient, Withdrawal } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ServiceResponse } from "../data/types";

import WithdrawalStatus from "../utils/withDrawalHelper";
import { handleError } from "../utils/errorHelper";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function saveWithdrawalRequest(
    userId: string,
    orderId: string,
    amount: number,
    withdrawalItem: object
): Promise<ServiceResponse> {
    try {
        const withdrawalRequest: Withdrawal = await prisma.withdrawal.create({
            data: {
                orderId,
                userId,
                amount,
                status: WithdrawalStatus.PENDING,
                withDrawalItem: JSON.stringify({ ...withdrawalItem }), // Store the withdrawal item as a JSON string
            },
        });
        return { 
            code: 200,
            message: `Withdrawal request saved successfully. STATUS: ${withdrawalRequest.status}`,
        };
    } catch (error: any) {
        return {
            code: 500,
            message: handleError(error),
        };
    }
}
