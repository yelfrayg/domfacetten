import { PrismaClient, Codes } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ServiceResponse } from "../data/types";
import { handleError } from "../utils/errorHelper";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

const getDiscountByCode = async (code: string): Promise<ServiceResponse> => {
    try {
        const findCode: Codes | null = await prisma.codes.findFirst({
            where: {
                codeId: code.toUpperCase()
            }
        })

        console.log('Gesucht nach:' + code.toUpperCase())
        console.log('Gefunden:' + findCode)
        const response: ServiceResponse = {
            code: findCode ? 200 : 404,
            message: findCode ? "Discount code found." : "Discount code not found.",
            data: findCode || null
        }
        return response;

    } catch (error) {
        return {
            code: 500,
            message: handleError(error),
        }
    }
}

const createDiscountCode = async (code: string, discount: number, available: boolean): Promise<ServiceResponse> => {
    try {
        const newCode: Codes = await prisma.codes.create({
            data: {
                codeId: code.toUpperCase(),
                codeValue: discount,
                expired: available
            }
        })
        const response: ServiceResponse = {
            code: newCode ? 201 : 500,
            message: newCode ? "Discount code created successfully." : "Failed to create discount code.",
            data: newCode
        }
        return response
    } catch (error) {
        return {
            code: 500,
            message: handleError(error)
        }
    }
}

module.exports = {
    getDiscountByCode,
    createDiscountCode
}