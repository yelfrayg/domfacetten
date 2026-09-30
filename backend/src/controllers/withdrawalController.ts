const withdrawalService = require("../services/withdrawalService.ts");
import { Request, Response } from "express";
import { ResponseObject, ServiceResponse } from "../data/types";
import { handleError } from "../utils/errorHelper";
import { Orders, Users } from "@prisma/client";

async function createWithdrawalRequest(req: Request, res: Response<ResponseObject<string>>) {
    try {
        const { userId, orderId, amount, withdrawalItem } = req.body;
        const newWithdrawal: ServiceResponse = await withdrawalService.saveWithdrawalRequest(userId, orderId, amount, withdrawalItem);
        const response: ResponseObject<string> = {
            status: newWithdrawal.code === 200 ? "SUCCESS" : "FAILURE",
            message: newWithdrawal.message,
        };
        res.status(newWithdrawal.code).json(response);
    }
    catch (error: any) {
        const response: ResponseObject<string> = {
            status: "FAILURE",
            message: handleError(error),
        };
        res.status(500).json(response);
    }
}

module.exports = {
    createWithdrawalRequest,
};
