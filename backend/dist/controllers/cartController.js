"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const errorHelper_1 = require("../utils/errorHelper");
const productService = require("../services/productService");
const cartService = require("../services/cartService");
const { verifyToken } = require("../middleware/checkAuth");
async function getCartItems(req, res) {
    try {
        const userId = req.userId;
        if (!userId || (req.params.id && req.params.id !== userId)) {
            return res.status(403).json({ status: "FAILURE", message: "Zugriff verweigert." });
        }
        const result = await cartService.getCartItems(userId);
        const response = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
            data: {
                reqData: result.data,
            },
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Abrufen des Warenkorb-Inhalts.",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
async function addToCart(req, res) {
    try {
        if (!req.userId || !req.body.productId || !req.body.quantity) {
            const response = {
                status: "FAILURE",
                message: "Ungültige Anfrage. Bitte stellen Sie sicher, dass userId, productId und quantity im Body enthalten sind.",
            };
            return res.status(400).json(response);
        }
        const result = await cartService.addToCart({
            ...req.body,
            userId: req.userId,
        });
        const response = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result ? result.message : "Fehler beim Hinzufügen des Artikels zum Warenkorb.",
            data: {
                reqData: result.data,
            },
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Hinzufügen des Artikels zum Warenkorb.",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
async function removeItem(req, res) {
    try {
        if (!req.userId || !req.body.productId) {
            const response = {
                status: "FAILURE",
                message: "Ungültige Anfrage. Bitte stellen Sie sicher, dass userId, productId und quantity im Body enthalten sind.",
            };
            return res.status(400).json(response);
        }
        const remove = await cartService.removeFromCart({
            ...req.body,
            userId: req.userId,
        });
        const response = {
            status: remove.code === 200 ? "SUCCESS" : "FAILURE",
            message: remove ? remove.message : "Fehler beim Entfernen des Artikels aus dem Warenkorb.",
        };
        res.status(remove.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Entfernen des Artikels aus dem Warenkorb.",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
async function findItemInCart(req, res) {
    try {
        const item = await cartService.findCartItem({
            ...req.body,
            userId: req.userId,
        });
        const response = {
            status: item.code === 200 ? "SUCCESS" : "FAILURE",
            message: item ? item.message : "Fehler beim Suchen des Artikels im Warenkorb.",
            data: item.data ? { reqData: item.data } : undefined,
        };
        res.status(item.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Suchen des Artikels im Warenkorb.",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
async function updateAmount(req, res) {
    try {
        const result = await cartService.updateCartItemAmount({
            ...req.body,
            userId: req.userId,
        });
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
            message: "Fehler beim Aktualisieren der Menge des Artikels im Warenkorb.",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
module.exports = {
    getCartItems,
    addToCart,
    removeItem,
    findItemInCart,
    updateAmount
};
