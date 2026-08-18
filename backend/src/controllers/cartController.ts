require("dotenv").config();
import { Request, Response } from "express";
import { PrismaClient, Cart } from "@prisma/client";
import { ResponseObject, ServiceResponse } from "../data/types";
import { handleError } from "../utils/errorHelper";

const productService = require("../services/productService");
const cartService = require("../services/cartService");
const { verifyToken } = require("../middleware/checkAuth");

async function getCartItems(req: Request, res: Response<ResponseObject>) {
    try {
        const userId = req.params.id;
        const result: ServiceResponse = await cartService.getCartItems(userId);
        const response: ResponseObject = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
            data: {
                reqData: result.data as Cart[],
            },
        };
        res.status(result.code).json(response);
    } catch (error) {
        const response: ResponseObject = {
            status: "FAILURE",
            message: "Fehler beim Abrufen des Warenkorb-Inhalts.",
            error: handleError(error),
        };
        res.status(500).json(response);
    }
}

async function addToCart(req: Request, res: Response<ResponseObject>) {
    try {
        if(!req.body.userId || !req.body.productId || !req.body.quantity) {
            const response: ResponseObject = {
                status: "FAILURE",
                message: "Ungültige Anfrage. Bitte stellen Sie sicher, dass userId, productId und quantity im Body enthalten sind.",
            };
            return res.status(400).json(response);
        }
        const result: ServiceResponse = await cartService.addToCart(req.body);
        const response: ResponseObject = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result ? result.message : "Fehler beim Hinzufügen des Artikels zum Warenkorb.",
            data: {
                reqData: result.data as Cart,
            },
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response: ResponseObject = {
            status: "FAILURE",
            message: "Fehler beim Hinzufügen des Artikels zum Warenkorb.",
            error: handleError(error),
        };
        res.status(500).json(response);
    }
}

async function removeItem(req: Request, res: Response<ResponseObject>) {
    try {
        if(!req.body.userId || !req.body.productId) {
            const response: ResponseObject = {
                status: "FAILURE",
                message: "Ungültige Anfrage. Bitte stellen Sie sicher, dass userId, productId und quantity im Body enthalten sind.",
            };
            return res.status(400).json(response);
        }
        const remove: ServiceResponse = await cartService.removeFromCart(req.body)
        const response: ResponseObject = {
            status: remove.code === 200 ? "SUCCESS" : "FAILURE",
            message: remove ? remove.message : "Fehler beim Entfernen des Artikels aus dem Warenkorb.",
        };
        res.status(remove.code).json(response)
    } catch (error) {
        const response: ResponseObject = {
            status: "FAILURE",
            message: "Fehler beim Entfernen des Artikels aus dem Warenkorb.",
            error: handleError(error),
        };
        res.status(500).json(response);
    }
}

async function findItemInCart(req: Request, res: Response<ResponseObject>) {
    try {
        const item: ServiceResponse = await cartService.findCartItem(req.body)
        const response: ResponseObject = {
            status: item.code === 200 ? "SUCCESS" : "FAILURE",
            message: item ? item.message : "Fehler beim Suchen des Artikels im Warenkorb.",
            data: item.data ? { reqData: item.data as Cart } : undefined,
        }
        res.status(item.code).json(response)
    } catch (error) {
        const response: ResponseObject = {
            status: "FAILURE",
            message: "Fehler beim Suchen des Artikels im Warenkorb.",
            error: handleError(error),
        };
        res.status(500).json(response);
    }
}

async function updateAmount(req: Request, res: Response<ResponseObject>) {
    try {
        const result: ServiceResponse = await cartService.updateCartItemAmount(req.body);
        const response: ResponseObject = {
            status: result.code === 200 ? "SUCCESS" : "FAILURE",
            message: result.message,
            data: result.data ? { reqData: result.data as Cart } : undefined,
        };
        res.status(result.code).json(response);
    }
    catch (error) {
        const response: ResponseObject = {
            status: "FAILURE",
            message: "Fehler beim Aktualisieren der Menge des Artikels im Warenkorb.",
            error: handleError(error),
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
}