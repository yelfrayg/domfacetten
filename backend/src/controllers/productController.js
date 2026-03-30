const productService = require("../services/productService");

async function fetchProducts(req, res) {
    try {
        const products = await productService.getAllProducts();
        return res.status(200).json({ message: "success", products: products });
    } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
        return res
            .status(500)
            .json({ message: "Fehler beim Laden der Produkte" });
    }
}

async function createProduct(req, res) {
    try {
        // TODO
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Fehler beim Erstellen des Produkts" });
    }
}

module.exports = { fetchProducts, createProduct };
