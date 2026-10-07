"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const errorHelper_1 = require("../utils/errorHelper");
const { generateToken } = require("../middleware/checkAuth");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});
async function checkCodeValidity(code) {
    try {
        const isValid = code === process.env.ADMIN_CODE;
        console.log(code, process.env.ADMIN_CODE, isValid);
        const response = {
            code: isValid ? 200 : 400,
            message: isValid ? "Code is valid" : "Code is invalid",
            data: isValid ? generateToken('admin', 'domfacetten@web.de') : null,
        };
        return response;
    }
    catch (error) {
        const response = {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
        return response;
    }
}
module.exports = {
    checkCodeValidity,
};
