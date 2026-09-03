import { PrismaClient, Prisma, Cart, Orders, Product } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ServiceResponse } from "../data/types";
import { handleError } from "../utils/errorHelper";
import { redis } from "../redis/redis";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function getCartItems(userId: string): Promise<ServiceResponse> {
    try {
        const cacheKey = `cart:${userId}`;
        const cachedCartItems = await redis.get(cacheKey);
        if (!cachedCartItems) {
            const cartItems: Cart[] = await prisma.cart.findMany({
                where: { userId: userId },
                include: {
                    product: true,
                },
            });
            await redis.set(cacheKey, JSON.stringify(cartItems), "EX", 3600); // Cache for 1 hour
            console.log('Cache Miss')
            return {
                code: 200,
                message: "Cartinhalt erfolgreich aus DB geholt.",
                data: cartItems,
            };
        }
        console.log('Cache Hit')
        return {
            code: 200,
            message: "Cartinhalt erfolgreich aus dem Cache geholt.",
            data: JSON.parse(cachedCartItems),
        };
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return {
            code: 500,
            message: handleError(error),
        };
    }
}

async function addToCart(data: {
    userId: string;
    productId: number;
    quantity: number;
}): Promise<ServiceResponse> {
    try {
        const { userId, productId, quantity } = data;
        console.log(data)
        await prisma.cart.create({
            data: {
                userId: userId,
                productId: productId,
                quantity: quantity,
            },
        });
        await redis.del(`cart:${userId}`); // Invalidate cache for the user's cart
        return {
            code: 200,
            message: "Erfolgreich zum Cart hinzugefügt.",
        };
    } catch (error) {
        return {
            code: 500,
            message: handleError(error),
        };
    }
}

async function removeFromCart(data: {
    userId: string;
    productId: number;
}): Promise<ServiceResponse> {
    try {
        const { userId, productId } = data;
        const deleteResult: Cart = await prisma.cart.delete({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
        });
        await redis.del(`cart:${userId}`); // Invalidate cache for the user's cart
        return {
            code: deleteResult ? 200 : 404,
            message: deleteResult
                ? `Artikel ${productId} erfolgreich aus dem Warenkorb entfernt.`
                : `Artikel ${productId} nicht im Warenkorb gefunden.`,
        };
    } catch (error) {
        return {
            code: 500,
            message: handleError(error),
        };
    }
}

async function findCartItem(data: {
    userId: string;
    productId: number;
}): Promise<ServiceResponse> {
    try {
        const { userId, productId } = data;
        const item: Cart | null = await prisma.cart.findFirst({
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
    } catch (error) {
        return {
            code: 500,
            message: handleError(error),
        };
    }
}

async function updateCartItemAmount(data: {
    userId: string;
    productId: number;
    quantity: number;
}): Promise<ServiceResponse> {
    try {
        const { userId, productId, quantity } = data;
        console.log(`Updating cart item for userId: ${userId}, productId: ${productId}, quantity: ${quantity}`);
        if (quantity <= 0) {
            return {
                code: 400,
                message:
                    "Ungültige Menge. Bitte geben Sie eine positive Zahl ein.",
            };
        }
        console.log(`Attempting to update cart item for userId: ${userId}, productId: ${productId} with quantity: ${quantity}`);
        const updatedItem: Cart = await prisma.cart.update({
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
        await redis.del(`cart:${userId}`); // Invalidate cache for the user's cart
        return {
            code: 200,
            message: 'Menge erfolgreich aktualisiert.',
            data: { updatedItem: updatedItem },
        };
    } catch (error) {
        return {
            code: 500,
            message: handleError(error),
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
