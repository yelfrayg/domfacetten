const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const path = require("path");
const fs = require("fs/promises");
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const { generateToken } = require("../middleware/checkAuth.js");
const { sendOTPMail } = require("../utils/mail/mail.js");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function createUser(data) {
    try {
        const { email, password } = data;
        const securedPw = await bcrypt.hash(password, SALT_ROUNDS)
        const user = await prisma.users.create({
            data: {
                email: email,
                password: securedPw,
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
                code: 2002,
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
        if(data.password && data.password.trim().length > 0) {
            data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
        } else {
            delete data.password;
        }
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
        
        if (data) {
            delete data.password;
        }

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
        
        const passwordMatch = await bcrypt.compare(password, findUser.password)
        
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

async function findUserByEmail(email) {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email
            }
        })
        return user;
    } catch (error) {
        return {
            code: 500,
            message: 'E-Mail ist nicht hinterlegt.'
        }
    }
}

async function requestPasswordReset(email) {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return {
                code: 404,
                message: 'E-Mail ist nicht hinterlegt.'
            }
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expirationTime = new Date(Date.now() + 3 * 60 * 1000); // 3 Minuten
        // OTP in der Datenbank speichern
        await prisma.users.update({
            where: {
                email: email
            },
            data: {
                otp: parseInt(otp),
                otpExpiry: expirationTime
            }
        });
        const sendMail = await sendOTPMail(email, otp);
        if(!sendMail || sendMail.code !== 200) {
            return {
                code: 500,
                message: 'Fehler beim Senden der OTP-Mail.'
            }
        }
        return {
            code: 200,
            message: 'OTP erfolgreich generiert und in der Datenbank gespeichert.',
        }
    } catch(error) {
        return {
            code: 500,
            message: error.message
        }
    }
}

async function verifyOTP(email, otp) {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return {
                code: 404,
                message: 'E-Mail ist nicht hinterlegt.'
            }
        }
        const currentTime = new Date();
        if (user.otp !== parseInt(otp)) {
            return {
                code: 400,
                message: 'Ungültiger OTP-Code.'
            }
        }
        if (currentTime > user.otpExpiry) {
            return {
                code: 400,
                message: 'OTP-Code ist abgelaufen.'
            }
        }
        return {
            code: 200,
            message: 'OTP-Code ist gültig.',
            userId: user.userId
        }
    } catch (error) {
        return {
            code: 500,
            message: error.message
        }
    }
}

async function updatePassword(email, newPassword) {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await prisma.users.update({
            where: {
                email: email
            },
            data: {
                password: hashedPassword
            }
        })
        return {
            code: 200,
            message: 'Passwort erfolgreich aktualisiert.'
        }
    } catch (error) {
        return {
            code: 500,
            message: error.message
        }
    }
}

module.exports = { createUser, updateUser, getUserData, deleteAccount, login, getOrders, findUserByEmail, requestPasswordReset, verifyOTP, updatePassword };