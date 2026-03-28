const { PrismaClient } = require('..generated/prisma/client');
const prisma = new PrismaClient();

const getAllProducts = async () => {
  try {
    return await prisma.product.findMany({
        include: { available: true }
    });
  }
  catch(error) {
    return []
  }
}

const createProduct = async (data) => {
    try {
        return await prisma.products.create({ data })
    }
    catch(error) {
        return {
            code: 500,
            message: "Fehler beim Erstellen"
        }
    }
}

module.exports = { getAllProducts, createProduct }