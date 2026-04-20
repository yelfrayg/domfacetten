require("dotenv").config();

const productService = require("../services/productService");
const purchaseService = require("../services/purchaseServices");
const paypal = require("@paypal/checkout-server-sdk");

const paypalEnvironment =
    process.env.NODE_ENV === "production"
        ? new paypal.core.LiveEnvironment(
              process.env.PAYPAL_CLIENT_ID,
              process.env.PAYPAL_SECRET_KEY,
          )
        : new paypal.core.SandboxEnvironment(
              process.env.PAYPAL_CLIENT_ID,
              process.env.PAYPAL_SECRET_KEY,
          );

const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

async function createPurchase(req, res) {
    try {
        const { data } = req.body;
        console.log("Empfangene Bestelldaten:", data);
        const product = await productService.getSingleProduct(
            data.arttype,
            data.artnr,
        );
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const serverOrder = await purchaseService.createOrder(
            product,
            data.amount,
        );

        if (!serverOrder) {
            return res
                .status(500)
                .json({ error: "Failed to create PayPal Order" });
        }

        const total = serverOrder.purchase_units[0].amount.totalValue.toString();

        const request = new paypal.orders.OrdersCreateRequest();

        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "EUR",
                        value: total,
                        breakdown: {
                            item_total: {
                                currency_code: "EUR",
                                value: total,
                            },
                        },
                    },
                    items: [
                        {
                            name: product.name,
                            unit_amount: {
                                currency_code: "EUR",
                                value: product.price.toFixed(2),
                            },
                            quantity: data.amount.toString(),
                        },
                    ],
                },
            ],
        });
        try {
            const order = await paypalClient.execute(request);
            const result = order.result;
            res.status(200).json({ id: result.id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { createPurchase };
