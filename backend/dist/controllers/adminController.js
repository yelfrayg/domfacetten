"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const errorHelper_1 = require("../utils/errorHelper");
const adminService = require("../services/adminService");
const { verifyToken } = require("../middleware/checkAuth");
async function verifyCode(req, res) {
    try {
        const { code } = req.body;
        const serviceResponse = await adminService.checkCodeValidity(code);
        const response = {
            status: serviceResponse.code == 200 ? 'SUCCESS' : 'FAILURE',
            message: serviceResponse.message,
            data: {
                reqData: serviceResponse.data,
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            status: 'FAILURE',
            message: "Error verifying code",
            error: (0, errorHelper_1.handleError)(error)
        };
        res.status(500).json(response);
    }
}
module.exports = {
    verifyCode
};
