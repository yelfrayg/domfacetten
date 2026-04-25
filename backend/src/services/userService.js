const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const path = require("path");
const fs = require("fs/promises");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function createUser(data) {
    try {
        const { email, password } = data;
        const user = await prisma.users.create({
            data: {
                email: email,
                password: password,
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
                message: "Ein Nutzer mit dieser E-Mail-Adresse existiert bereits.",
            };
        }
        return {
            code: 400,
            message: error.message,
        };
    }
}

module.exports = { createUser };
