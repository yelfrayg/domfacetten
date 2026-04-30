require("dotenv").config();

const productService = require("../services/productService");
const cartService = require("../services/cartService");
const { verifyToken } = require("../middleware/checkAuth");

async function getCartItems(req, res) {
    try {
        const userId = req.params.id;
        const result = await cartService.getCartItems(userId);
        res.status(result.code).json(result);
    } catch (error) {
        res.status(500).json({ code: 500, message: "Etwas ist beim Abrufen des Warenkorb-Inhalts schiefgelaufen." });
    }
}

async function addToCart(req, res) {
    try {
        if(!req.body.userId || !req.body.productId || !req.body.quantity) {
            return res.status(400).json({ code: 400, message: "Ungültige Anfrage. Bitte stellen Sie sicher, dass userId, productId und quantity im Body enthalten sind." });
        }
        const result = await cartService.addToCart(req.body);
        res.status(200).json({ code: result.code, message: result.message });
    } catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
}

async function removeItem(req, res) {
    try {
        const remove = await cartService.removeFromCart(req.body)
        res.status(200).json({ message: remove.message })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function findItemInCart(req, res) {
    try {
        const item = await cartService.findCartItem(req.body)
        res.status(200).json({ found: item.found, message: 'Funktion zum Suchen wurde ausgeführt.' })
    } catch (error) {
        res.status(500).json({ found: false, message: error.message })
    }
}

module.exports = {
    getCartItems,
    addToCart,
    removeItem,
    findItemInCart
};