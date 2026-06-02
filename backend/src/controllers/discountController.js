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

module.exports = {
    getDiscount
}
