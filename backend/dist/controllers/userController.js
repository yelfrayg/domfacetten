"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userService = require("../services/userService.ts");
const errorHelper_1 = require("../utils/errorHelper");
async function createNewUser(req, res) {
    try {
        const newUser = await userService.createUser(req.body);
        console.log(newUser);
        const response = {
            status: newUser ? "SUCCESS" : "FAILURE",
            message: newUser
                ? newUser.message
                : "Fehler beim Weiterreichen des Nutzerdaten",
            data: newUser ? newUser.data : "",
        };
        res.status(newUser.code).json(response);
    }
    catch (error) {
        console.error("Fehler beim Erstellen eines neuen Nutzers:", error);
        const response = {
            status: 'FAILURE',
            message: 'Fehler beim Erstellen eines neuen Nutzers',
            error: (0, errorHelper_1.handleError)(error),
        };
        return res
            .status(500)
            .json(response);
    }
}
async function updateUserInfo(req, res) {
    try {
        const data = req.body;
        data.userId = req.params.id;
        const result = await userService.updateUser(data);
        const response = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
            data: result.data ? { reqData: result.data } : undefined,
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Aktualisieren der Nutzerdaten",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
async function getUserData(req, res) {
    try {
        const userId = req.params.id;
        const userData = await userService.getUserData(userId);
        const response = {
            status: userData.code === 200 ? "SUCCESS" : "FAILURE",
            message: userData.message,
            data: userData.data ? { reqData: userData.data } : undefined,
        };
        res.status(userData.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Abrufen der Nutzerdaten",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
async function deleteUser(req, res) {
    try {
        const userId = req.params.id;
        const result = await userService.deleteAccount(userId);
        const response = {
            status: 'SUCCESS',
            message: result.message
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: 'SUCCESS',
            message: 'Es gab einen Fehler beim Löschen'
        };
        res.status(500).json(response);
    }
}
async function loginUser(req, res) {
    try {
        const userData = req.body;
        const findUser = await userService.login(userData);
        const response = {
            status: findUser.code === 200 ? "SUCCESS" : "FAILURE",
            message: findUser.message,
            data: findUser.data ? { reqData: findUser.data } : undefined,
        };
        res.status(findUser.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Einloggen des Nutzers",
        };
        res.status(500).json(response);
    }
}
async function fetchOrders(req, res) {
    try {
        const userId = req.params.id;
        const result = await userService.getOrders(userId);
        const response = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
            data: result.data ? { reqData: result.data } : undefined,
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Abrufen der Bestellungen",
        };
        res.status(500).json(response);
    }
}
async function requestOTP(req, res) {
    try {
        const { email } = req.body;
        const result = await userService.requestPasswordReset(email);
        const response = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
        };
        return res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: 'Fehler beim Anfordern des OTP',
        };
        return res.status(500).json(response);
    }
}
async function verifyOTP(req, res) {
    try {
        const { email, otp } = req.body;
        const result = await userService.verifyOTP(email, otp);
        const response = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
            data: result.data ? { reqData: result.data } : undefined,
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: 'Fehler beim Überprüfen des OTP',
        };
        res.status(500).json(response);
    }
}
async function updatePassword(req, res) {
    try {
        const { email, mail, newPassword } = req.body;
        const targetEmail = email || mail;
        const result = await userService.updatePassword(targetEmail, newPassword);
        const response = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
        };
        if (!result) {
            return res
                .status(result.code)
                .json(response);
        }
        return res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: 'Fehler beim Aktualisieren des Passworts',
        };
        return res.status(500).json(response);
    }
}
module.exports = {
    createNewUser,
    updateUserInfo,
    getUserData,
    deleteUser,
    loginUser,
    fetchOrders,
    requestOTP,
    verifyOTP,
    updatePassword,
};
