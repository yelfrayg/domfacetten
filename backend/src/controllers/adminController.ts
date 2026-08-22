require("dotenv").config();
import { Request, Response } from "express";
import { ResponseObject, ServiceResponse } from "../data/types";
import { handleError } from "../utils/errorHelper";

const adminService = require("../services/adminService");
const { verifyToken } = require("../middleware/checkAuth");

async function verifyCode(req: Request, res: Response) {
    try {
        const { code } = req.body;
        const serviceResponse: ServiceResponse = await adminService.checkCodeValidity(code);
        const response: ResponseObject = {
            status: serviceResponse.code == 200 ? 'SUCCESS' : 'FAILURE',
            message: serviceResponse.message,
            data: {
                reqData: serviceResponse.data as string,
            }
        };
        res.status(200).json(response);
    } catch (error) {
        const response: ResponseObject = {
            status: 'FAILURE',
            message: "Error verifying code",
            error: handleError(error)
        };
        res.status(500).json(response); 
    }
}

module.exports = {
    verifyCode
};