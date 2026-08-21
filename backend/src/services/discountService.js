const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

const getDiscountByCode = async (code) => {
    try {
        const findCode = await prisma.codes.findFirst({
            where: {
                codeId: code.toUpperCase()
            }
        })

        console.log('Gesucht nach:' + code.toUpperCase())
        console.log('Gefunden:' + findCode)
        if(findCode.expired == true) {
            return {
                code: 401,
                message: 'Code nicht mehr gültig!'
            }
        }
        return {
            code: 200,
            discountObj: findCode
        }
    } catch (error) {
        return {
            code: 500,
            message: error.message
        }
    }
}

const createDiscountCode = async (code, discount, available) => {
    try {
        const newCode = await prisma.codes.create({
            data: {
                codeId: code.toUpperCase(),
                codeValue: discount,
                expired: available
            }
        })
        return {
            code: 201,
            discountObj: newCode
        }
    } catch (error) {
        return {
            code: 500,
            message: error.message
        }
    }
}

module.exports = {
    getDiscountByCode,
    createDiscountCode
}