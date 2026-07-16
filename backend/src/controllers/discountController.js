require("dotenv").config();

const discountService = require("../services/discountService")

async function getDiscount(req, res) {
    try {
        const discount = await discountService.getDiscountByCode(req.params.code);
        res.status(200).json(discount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createCode(req, res) {
    try {
        const { data } = req.body;
        const { code, discount, available } = data;

        const newCode = await discountService.createDiscountCode(code, discount, available);
        res.status(201).json(newCode);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getDiscount,
    createCode
}
