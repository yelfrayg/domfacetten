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
    reason: string,
    withdrawalItems: number[]
): Promise<ServiceResponse> {
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


        const withdrawalRequest: Withdrawal = await prisma.withdrawal.create({
            data: {
                userId,
                orderId,
                reason: reason || "Kein Grund angegeben",
                status: WithdrawalStatus.PENDING,
                withDrawalItems: withdrawalItems,
            },
        });
        return { 
            code: 200,
            message: withdrawalRequest.status,
        };
    } catch (error: any) {
        return {
            code: 500,
            message: handleError(error),
        };
    }
}

async function findAllWithdrawals(): Promise<ServiceResponse> {
    try {
        const all = await prisma.withdrawal.findMany();
        return {
            code: 200,
            data: all,
            message: "Alle Rücksendungen erfolgreich abgerufen. Anzahl: " + all.length,
        };
    } 
    catch (error: any) {
        return {
            code: 500,
            message: handleError(error),
        };        
    }
}

module.exports = { saveWithdrawalRequest, findAllWithdrawals };