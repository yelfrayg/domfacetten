const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const path = require("path");
const fs = require("fs/promises");
const argon = require('argon2')
const { generateToken } = require("../middleware/checkAuth.js");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function createUser(data) {
    try {
        const { email, password } = data;
        const hashedPw = await argon.hash(password)
        const user = await prisma.users.create({
            data: {
                email: email,
                password: hashedPw,
            },
        });

        return {
            code: 200,
            message: "Nutzer erfolgreich erstellt.",
            userId: user.userId
        };
    } catch (error) {
        console.log("Fehler beim Erstellen eines neuen Nutzers:", error.code);
        if (error.code === "P2002" /* Unique constraint violation */) {
            return {
                code: 400,
                message:
                    "Ein Nutzer mit dieser E-Mail-Adresse existiert bereits.",
            };
        }
        return {
            code: 400,
            message: error.message,
        };
    }
}

async function updateUser(data) {
    try {
        data.password = await argon.hash(data.password)
        await prisma.users.update({
            where: {
                userId: data.userId,
            },
            data: data,
        });
        return {
            code: 200,
            message: "Erfolgreich aktualisiert!",
        };
    } catch (error) {
        return {
            code: 500,
            message: error.message,
        };
    }
}

async function getUserData(userId) {
    try {
        const data = await prisma.users.findFirst({
            where: {
                userId: userId,
            },
        });
        return {
            code: 200,
            userInfo: data,
        };
    } catch (error) {
        return {
            code: 500,
            message: error.message,
        };
    }
}

async function deleteAccount(userId) {
    try {
        // Zuerst Cart-Einträge löschen
        await prisma.cart.deleteMany({
            where: {
                userId: userId
            }
        })

        // Dann Orders löschen
        await prisma.orders.deleteMany({
            where: {
                customerId: userId
            }
        })

        // Zuletzt den User löschen
        await prisma.users.delete({
            where: {
                userId: userId
            }
        })

        return {
            code: 200,
            message: 'User erfolgreich gelöscht!'
        }
    } catch (error) {
        return {
            code: 500,
            message: error.message
        }
    }
}

async function login(data) {
    try {
        const { email, password } = data;
        
        // Nutzer nach Email suchen
        const findUser = await prisma.users.findFirst({
            where: {
                email: email
            }
        })
        
        if (!findUser) {
            return {
                code: 401,
                message: 'E-Mail oder Passwort falsch'
            }
        }
        
        const passwordMatch = await argon.verify(findUser.password, password)
        
        if (!passwordMatch) {
            return {
                code: 401,
                message: 'E-Mail oder Passwort falsch'
            }
        }
        
        return {
            code: 200,
            userId: findUser.userId,
            userToken: generateToken(findUser.userId, findUser.email)
        }
    } catch (error) {
        return {
            code: 500,
            message: error.message,
        }
    }
}

async function getOrders(userId) {
    try {
        const fetchOrders = await prisma.orders.findMany({
            where: {
                customerId: userId
            }
        })
        return {
            code: 200,
            orders: fetchOrders
        }
    } catch (error) {
        return {
            code: 500,
            message: error.message
        }
    }
}

module.exports = { createUser, updateUser, getUserData, deleteAccount, login, getOrders };