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

const createNewProduct = async (data) => {
    try {
        return await prisma.product.create({
            data: {
                arttype: data.arttype,
                artnr: data.artnr,
                name: data.name,
                description: data.description,
                keywords: data.keywords,
                price: data.price,
                available: data.available,
                heroImage: data.heroImage,
                image2: data.secondImage,
                image3: data.thirdImage,
            },
        });
    } catch (error) {
        return {
            code: 500,
            message: "Fehler beim Erstellen",
        };
    }
};

module.exports = { getAllProducts, createNewProduct };
