const productService = require("../services/productService");

async function fetchProducts() {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Laden der Produkte" });
    }
}

module.exports = { fetchProducts }