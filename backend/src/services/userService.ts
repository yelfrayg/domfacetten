import { PrismaClient, Users, Orders } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ServiceResponse } from "../data/types";
// import path from "path";
// import fs from "fs/promises";
import bcrypt from "bcrypt";
import { handleError } from "../utils/errorHelper";
const SALT_ROUNDS = 10;
const { generateToken } = require("../middleware/checkAuth.js");
const { sendOTPMail } = require("../utils/mail/mail.js");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function createUser(data: any): Promise<ServiceResponse> {
    try {
        const { email, password } = data;
        const securedPw = await bcrypt.hash(password, SALT_ROUNDS);
        const user: Users = await prisma.users.create({
            data: {
                email: email,
                password: securedPw,
            },
        });

        const response: ServiceResponse = {
            code: 201, // Created
            message: "Nutzer erfolgreich erstellt",
            data: user,
        };
        return response;
    } catch (error: any) {
        const response: ServiceResponse = {
            code: error?.code === "P2002" ? 409 : 404,
            message:
                error?.code === "P2002"
                    ? "Nutzer existiert bereits."
                    : "Nutzer existiert zwar nicht, aber es gab ein anderes Problem.",
        };
        return response;
    }
}

async function updateUser(data: any): Promise<ServiceResponse> {
    try {
        const { userId, ...updateData } = data;

        if (!userId) {
            return {
                code: 400,
                message: "UserId fehlt beim Aktualisieren.",
            };
        }

        if (updateData.password && updateData.password.trim().length > 0) {
            updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
        } else {
            delete updateData.password;
        }

        if (updateData.email && typeof updateData.email === "string") {
            const trimmedEmail = updateData.email.trim();
            if (!trimmedEmail) {
                delete updateData.email;
            } else {
                const currentUser = await prisma.users.findUnique({
                    where: {
                        userId: userId,
                    },
                });

                const sameEmailAsCurrentUser =
                    currentUser &&
                    currentUser.email.toLowerCase() === trimmedEmail.toLowerCase();

                if (!sameEmailAsCurrentUser) {
                    const existingUser = await prisma.users.findUnique({
                        where: {
                            email: trimmedEmail,
                        },
                    });

                    if (existingUser && existingUser.userId !== userId) {
                        return {
                            code: 409,
                            message: "Diese E-Mail-Adresse wird bereits verwendet.",
                        };
                    }
                }

                updateData.email = trimmedEmail;
            }
        }

        const update: Users = await prisma.users.update({
            where: {
                userId: userId,
            },
            data: updateData,
        });

        const response: ServiceResponse = {
            code: update ? 200 : 400,
            message: update
                ? "Erfolgreich aktualisiert."
                : "Fehler beim Aktualisieren",
            data: update,
        };
        return response;
    } catch (error: any) {
        if (error?.code === "P2002") {
            return {
                code: 409,
                message: "Ein Datensatz mit dieser E-Mail-Adresse existiert bereits.",
            };
        }

        const response: ServiceResponse = {
            code: 500,
            message: handleError(error),
        };
        return response;
    }
}

async function getUserData(userId: string): Promise<ServiceResponse> {
    try {
        const data: Users | null = await prisma.users.findFirst({
            where: {
                userId: userId,
            },
        });

        const response: ServiceResponse = {
            code: 200,
            message: "Nutzerdaten erfolgreich abgerufen.",
            data: data,
        };

        return response;
    } catch (error) {
        const response: ServiceResponse = {
            code: 500,
            message: handleError(error),
        };
        return response;
    }
}

async function deleteAccount(userId: string): Promise<ServiceResponse> {
    try {
        // Zuerst Cart-Einträge löschen
        const delUserCart = await prisma.cart.deleteMany({
            where: {
                userId: userId,
            },
        });

        // Dann Orders löschen
        const delUserOrders = await prisma.orders.deleteMany({
            where: {
                customerId: userId,
            },
        });

        // Zuletzt den User löschen
        const delUserAccount = await prisma.users.delete({
            where: {
                userId: userId,
            },
        });

        const response: ServiceResponse = {
            code: delUserOrders && delUserCart && delUserAccount ? 204 : 400,
            message:
                delUserOrders && delUserCart && delUserAccount
                    ? "Erfolgreich gelöscht."
                    : "Beim Löschen ist etwas schiefgelaufen.",
        };

        return response;
    } catch (error) {
        const response: ServiceResponse = {
            code: 500,
            message: "Beim Löschen gab es einen Fehler.",
        };
        return response;
    }
}

async function login(data: any): Promise<ServiceResponse> {
    try {
        const { email, password } = data;

        const findUser: Users | null = await prisma.users.findFirst({
            where: {
                email: email,
            },
        });

        if (!findUser) {
            const response: ServiceResponse = {
                code: 401,
                message: "Nutzer existiert nicht.",
            };
            return response;
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);

        // if (!passwordMatch) {
        //     return {
        //         code: 401,
        //         message: "Passwort falsch.",
        //     };
        // }

        const response: ServiceResponse = {
            code: passwordMatch ? 200 : 401,
            message: passwordMatch
                ? "User gefunden."
                : "Falsches Passwort oder falsche E-Mail.",
            data: passwordMatch
                ? {
                      userId: findUser.userId,
                      userToken: generateToken(findUser.userId, findUser.email),
                  }
                : null,
        };

        return response;
    } catch (error) {
        const response: ServiceResponse = {
            code: 500,
            message: "Serverfehler beim Einloggen.",
        };
        return response;
    }
}

async function getOrders(userId: string): Promise<ServiceResponse> {
    try {
        const fetchOrders: Orders[] = await prisma.orders.findMany({
            where: {
                customerId: userId,
            },
        });

        const response: ServiceResponse = {
            code: fetchOrders ? 200 : 400,
            message:
                fetchOrders.length > 0
                    ? "Bestellungen gefunden."
                    : "Keine Bestellungen gefunden.",
            data: fetchOrders,
        };
        return response;
    } catch (error) {
        const response: ServiceResponse = {
            code: 500,
            message: "Serverfehler beim Holen der Bestellungen.",
        };
        return response;
    }
}

async function findUserByEmail(email: string): Promise<Users | null> {
    const user: Users | null = await prisma.users.findFirst({
        where: {
            email: email,
        },
    });
    return user;
}

async function requestPasswordReset(email: string) {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return {
                code: 404,
                message: "E-Mail ist nicht hinterlegt.",
            };
        }
        const generateOTP = Math.floor(100000 + Math.random() * 900000);
        const expirationTime = new Date(Date.now() + 3 * 60 * 1000); // 3 Minuten
        // OTP in der Datenbank speichern
        await prisma.users.update({
            where: {
                email: email,
            },
            data: {
                otp: generateOTP,
                otpExpiry: expirationTime,
            },
        });
        const sendMail = await sendOTPMail(email, generateOTP);
        if (!sendMail || sendMail.code !== 200) {
            return {
                code: 500,
                message: "Fehler beim Senden der OTP-Mail.",
            };
        }
        return {
            code: 200,
            message:
                "OTP erfolgreich generiert und in der Datenbank gespeichert.",
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
        return {
            code: 500,
            message: errorMessage,
        };
    }
}

async function verifyOTP(email: string, otp: number): Promise<ServiceResponse> {
    try {
        const normalizedOtp = Number(otp);
        const user: Users | null = await findUserByEmail(email);
        if (user == null) {
            return {
                code: 404,
                message: "Nutzer mit dieser E-Mail-Adresse existiert nicht.",
            };
        }
        const currentTime = new Date();
        // console.log(user.otp, normalizedOtp);

        if (Number(user.otp) !== normalizedOtp) {
            return {
                code: 422, // Nutzer existiert, aber OTP stimmt nicht überein
                message: "Ungültiger OTP-Code.",
            };
        }
        if (currentTime > user.otpExpiry) {
            return {
                code: 400,
                message: "OTP-Code ist abgelaufen.",
            };
        }
        return {
            code: 200,
            message: "OTP-Code ist gültig.",
            data: { userId: user.userId },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
        return {
            code: 500,
            message: errorMessage,
        };
    }
}

async function updatePassword(
    email: string,
    newPassword: string,
): Promise<ServiceResponse> {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await prisma.users.update({
            where: {
                email: email,
            },
            data: {
                password: hashedPassword,
            },
        });
        const response: ServiceResponse = {
            code: 200,
            message: "Passwort erfolgreich aktualisiert.",
        };
        return response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
        return {
            code: 500,
            message: errorMessage,
        };
    }
}

module.exports = {
    createUser,
    updateUser,
    getUserData,
    deleteAccount,
    login,
    getOrders,
    findUserByEmail,
    requestPasswordReset,
    verifyOTP,
    updatePassword,
};
