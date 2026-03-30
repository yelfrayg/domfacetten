const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["query", "info", "warn", "error"],
});

const getAllProducts = async () => {
    try {
        return await prisma.product.findMany();
    } catch (error) {
        return [];
    }
};

const createProduct = async (data) => {
    try {
        return await prisma.product.create({ data });
    } catch (error) {
        return {
            code: 500,
            message: "Fehler beim Erstellen",
        };
    }
};

const createImages = async (data) => {
    try {
        // TODO
    } catch (error) {
        return {
            code: 500,
            message: "Fehler beim Erstellen",
        };
    }
};

module.exports = { getAllProducts, createProduct, createImages };
