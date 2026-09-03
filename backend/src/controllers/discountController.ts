import { Codes } from "@prisma/client";
import { ResponseObject, ServiceResponse } from "../data/types";
import { Request, Response } from "express";
import { handleError } from "../utils/errorHelper";
require("dotenv").config();

const discountService = require("../services/discountService")

async function getDiscount(req: Request, res: Response<ResponseObject<Codes>>) {
    try {
        const discount: ServiceResponse = await discountService.getDiscountByCode(req.params.code);
        const response: ResponseObject<Codes> = {
            status: discount.code === 200 ? "SUCCESS" : "FAILURE",
            message: discount.message,
            data: {
                reqData: discount.data as Codes,
            },
        }
        res.status(discount.code).json(response);
    } catch (error) {
        const response: ResponseObject<Codes> = {
            status: "FAILURE",
            message: "Fehler beim Abrufen des Rabattcodes.",
            error: handleError(error),
        };
        res.status(500).json(response);
    }
}

async function createCode(req: Request, res: Response<ResponseObject<Codes>>) {
    try {
        const { data } = req.body;
        const { code, discount, available } = data;
        const newCode: ServiceResponse = await discountService.createDiscountCode(code, discount, available);
        const response: ResponseObject<Codes> = {
            status: newCode.code === 201 ? "SUCCESS" : "FAILURE",
            message: newCode.message,
            data: {
                reqData: newCode.data as Codes,
            },
        }
        res.status(newCode.code).json(response);
    } catch (error) {
        const response: ResponseObject<Codes> = {
            status: "FAILURE",
            message: "Fehler beim Erstellen des Rabattcodes.",
            error: handleError(error),
        };
        res.status(500).json(response);
    }
}

module.exports = {
    getDiscount,
    createCode
}
