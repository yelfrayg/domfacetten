require('dotenv').config();

const express = require('express')
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function checkUserExists(req, res, next) {
    try {
        const { email, password } = req.body
        const check = prisma
    } catch (error) {
        res.status(500).json({ message: 'Unerlaubter Zugriff' })
    }
}

// module.exports = {
//     checkDate,
// };