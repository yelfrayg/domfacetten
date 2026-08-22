"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const errorHelper_1 = require("../utils/errorHelper");
const redis_1 = require("../redis/redis");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});
async function getCartItems(userId) {
    try {
        const cacheKey = `cart:${userId}`;
        const cachedCartItems = await redis_1.redis.get(cacheKey);
        if (!cachedCartItems) {
            const cartItems = await prisma.cart.findMany({
                where: { userId: userId },
                include: {
                    product: true,
                },
            });
            await redis_1.redis.set(cacheKey, JSON.stringify(cartItems), "EX", 3600); // Cache for 1 hour
            console.log('Cache Miss');
            return {
                code: 200,
                message: "Cartinhalt erfolgreich aus DB geholt.",
                data: cartItems,
            };
        }
        console.log('Cache Hit');
        return {
            code: 200,
            message: "Cartinhalt erfolgreich aus dem Cache geholt.",
            data: JSON.parse(cachedCartItems),
        };
    }
    catch (error) {
        console.error("Error fetching cart items:", error);
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
    }
}
async function addToCart(data) {
    try {
        const { userId, productId, quantity } = data;
        console.log(data);
        await prisma.cart.create({
            data: {
                userId: userId,
                productId: productId,
                quantity: quantity,
            },
        });
        await redis_1.redis.del(`cart:${userId}`); // Invalidate cache for the user's cart
        return {
            code: 200,
            message: "Erfolgreich zum Cart hinzugefügt.",
        };
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
    }
}
async function removeFromCart(data) {
    try {
        const { userId, productId } = data;
        const deleteResult = await prisma.cart.delete({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
        });
        await redis_1.redis.del(`cart:${userId}`); // Invalidate cache for the user's cart
        return {
            code: deleteResult ? 200 : 404,
            message: deleteResult
                ? `Artikel ${productId} erfolgreich aus dem Warenkorb entfernt.`
                : `Artikel ${productId} nicht im Warenkorb gefunden.`,
        };
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
    }
}
async function findCartItem(data) {
    try {
        const { userId, productId } = data;
        const item = await prisma.cart.findFirst({
            where: {
                userId: userId,
                productId: productId,
            },
        });
        return {
            code: item ? 200 : 404,
            message: item
                ? "Artikel im Warenkorb gefunden."
                : "Artikel nicht im Warenkorb gefunden.",
            data: { item: item },
        };
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
        };
    }
}
async function updateCartItemAmount(data) {
    try {
        const { userId, productId, quantity } = data;
        console.log(`Updating cart item for userId: ${userId}, productId: ${productId}, quantity: ${quantity}`);
        if (quantity <= 0) {
            return {
                code: 400,
                message: "Ungültige Menge. Bitte geben Sie eine positive Zahl ein.",
            };
        }
        console.log(`Attempting to update cart item for userId: ${userId}, productId: ${productId} with quantity: ${quantity}`);
        const updatedItem = await prisma.cart.update({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
            data: {
                quantity: quantity,
            },
        });
        await redis_1.redis.del(`cart:${userId}`); // Invalidate cache for the user's cart
        return {
            code: 200,
            message: 'Menge erfolgreich aktualisiert.',
            data: { updatedItem: updatedItem },
        };
    }
    catch (error) {
        return {
            code: 500,
            message: (0, errorHelper_1.handleError)(error),
            data: null,
        };
    }
}
module.exports = {
    getCartItems,
    addToCart,
    removeFromCart,
    findCartItem,
    updateCartItemAmount,
};
