require("dotenv").config();

const productService = require("../services/productService");
const purchaseService = require("../services/purchaseServices");
const paypal = require("@paypal/checkout-server-sdk");
const mailUtility = require("../utils/mail/mail")

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

        const serverAmount = serverOrder.purchase_units[0].amount;
        const total = serverAmount.totalValue;
        const itemTotal = serverAmount.itemTotalValue;
        const shipping = serverAmount.shippingValue;

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
                                value: itemTotal,
                            },
                            shipping: {
                                currency_code: "EUR",
                                value: shipping,
                            },
                        },
                    },
                    items: [
                        {
                            name: product.name,
                            unit_amount: {
                                currency_code: "EUR",
                                value: serverAmount.singleValue,
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

async function savePurchase(req, res) {
    try {
        const { orderId, customerDetails, products } = req.body
        let data = {
            orderId,
            customerDetails,
            products
        }
        const result = await purchaseService.saveOrder(data)

        if(result.code === 500) {
            return res.status(500).json({ error: result.error || result.message })
        }

        let mailData = {
            customerFirstname: customerDetails.name.given_name,
            customerMail: customerDetails.email_address
        }
        const sendMail = mailUtility.sendMail(mailData)
        
        res.status(201).json({ message: "Bestellung erfolgreich gespeichert", orderId: result.orderId })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function sendMessage(req, res) {
    try {
        const { orderId, message } = req.body;
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createPurchase, savePurchase, sendMessage };
