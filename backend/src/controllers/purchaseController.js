const productService = require("../services/productService");
const purchaseService = require('../services/pruchaseServices')

async function createPurchase(req, res) {
  try {
    const { data } = req.body;
    const product = await productService.getSingleProduct(data.arttype, data.artnr);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const orderId = await purchaseService.createOrder(product, data.amount)

    if(!orderId) {
      return res.status(500).json({ error: "Failed to create PayPal Order" });
    }
    res.status(201).json({ id: orderId });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { createPurchase };
