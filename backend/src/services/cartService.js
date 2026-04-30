const { PrismaClient, Prisma } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const path = require("path");
const fs = require("fs/promises");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function getCartItems(userId) {
    try {
        const cartItems = await prisma.cart.findMany({
            where: { userId: userId },
            include: {
                product: true,
            },
        });
        return {
            code: 200,
            cartItems: cartItems,
        };
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return {
            code: 500,
            message: error.message,
        };
    }
}

async function addToCart(data) {
    try {
        const { userId, productId, quantity } = data;
        await prisma.cart.create({
            data: {
                userId: userId,
                productId: productId,
                quantity: quantity,
            }
        });
        return {
            code: 200,
            message: "Erfolgreich zum Cart hinzugefügt.",
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                console.log("Dieser Artikel ist bereits im Warenkorb!");
                return {
                    code: 2002,
                    message: "Artikel bereits vorhanden.",
                };
            }
        }
        return {
            code: 500,
            message: "Etwas ist beim Hinzufügen schiefgelaufen.",
        };
    }
}

async function removeFromCart(data) {
    try {
        const { userId, productId } = data
        await prisma.cart.delete({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId
                }
            }
        });
        return {
            code: 200,
            message: `Artikel ${productId} erfolgreich aus dem Warenkorb entfernt.`,
        };
    } catch (error) {
        return {
            code: 500,
            message: 'Es gab einen Fehler beim Entfernen.'
        }
    }
}

async function findCartItem(data) {
    try {
        const { userId, productId } = data
        const count = await prisma.cart.count({
            where: {
                userId: userId,
                productId: productId
            }
        })

        let found 
        if(count > 0) {
            found = true
        }
        else {
            found = false
        }

        return {
            code: 200,
            found: found
        }
    } catch (error) {
        return {
            code: 500,
            found: false,
            message: error.message
        }
    }
}

module.exports = {
    getCartItems,
    addToCart,
    removeFromCart,
    findCartItem
};
