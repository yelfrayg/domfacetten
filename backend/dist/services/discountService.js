"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const errorHelper_1 = require("../utils/errorHelper");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});
const getDiscountByCode = async (code) => {
    try {
        const findCode = await prisma.codes.findFirst({
            where: {
                codeId: code.toUpperCase()
            }
        });
        console.log('Gesucht nach:' + code.toUpperCase());
        console.log('Gefunden:' + findCode);
        const response = {
            code: findCode ? 200 : 404,
            message: findCode ? "Discount code found." : "Discount code not found.",
            data: findCode || null
        };
        return response;
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
    }
};
const createDiscountCode = async (code, discount, available) => {
    try {
        const newCode = await prisma.codes.create({
            data: {
                codeId: code.toUpperCase(),
                codeValue: discount,
                expired: available
            }
        });
        const response = {
            code: newCode ? 201 : 500,
            message: newCode ? "Discount code created successfully." : "Failed to create discount code.",
            data: newCode
        };
        return response;
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error)
        };
    }
};
module.exports = {
    getDiscountByCode,
    createDiscountCode
};
