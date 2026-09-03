import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ServiceResponse } from "../data/types";
import { handleError } from "../utils/errorHelper";
const { generateToken } = require("../middleware/checkAuth");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function checkCodeValidity(code: string): Promise<ServiceResponse> {
    try {
        const isValid = code === process.env.ADMIN_CODE;
        console.log(code, process.env.ADMIN_CODE, isValid);
        const response: ServiceResponse = {
            code: isValid ? 200 : 400,
            message: isValid ? "Code is valid" : "Code is invalid",
            data: isValid ? generateToken('admin', 'domfacetten@web.de') : null,
        };
        return response;
    } catch (error) {
        const response: ServiceResponse = {
            code: 500,
            message: handleError(error),
        };
        return response;
    }
}

module.exports = {
    checkCodeValidity,
};