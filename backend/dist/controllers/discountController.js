"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHelper_1 = require("../utils/errorHelper");
require("dotenv").config();
const discountService = require("../services/discountService");
async function getDiscount(req, res) {
    try {
        const discount = await discountService.getDiscountByCode(req.params.code);
        const response = {
            status: discount.code === 200 ? "SUCCESS" : "FAILURE",
            message: discount.message,
            data: {
                reqData: discount.data,
            },
        };
        res.status(discount.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Abrufen des Rabattcodes.",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
async function createCode(req, res) {
    try {
        const { data } = req.body;
        const { code, discount, available } = data;
        const newCode = await discountService.createDiscountCode(code, discount, available);
        const response = {
            status: newCode.code === 201 ? "SUCCESS" : "FAILURE",
            message: newCode.message,
            data: {
                reqData: newCode.data,
            },
        };
        res.status(newCode.code).json(response);
    }
    catch (error) {
        const response = {
            status: "FAILURE",
            message: "Fehler beim Erstellen des Rabattcodes.",
            error: (0, errorHelper_1.handleError)(error),
        };
        res.status(500).json(response);
    }
}
module.exports = {
    getDiscount,
    createCode
};
