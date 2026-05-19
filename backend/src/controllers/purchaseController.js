require("dotenv").config();

const productService = require("../services/productService");
const purchaseService = require("../services/purchaseServices");
const invoiceService = require("../services/invoiceService");
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

async function createSinglePurchase(req, res) {
    try {
        const data = req.body.data || req.body;
        console.log("Empfangene Bestelldaten:", data);
        const product = await productService.getSingleProduct(data.arttype, data.artnr);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        if (!req.userId) {
            return res.status(403).json({ error: "Nutzer muss erst angemeldet sein." })
        }

        let orderData = {
            userId: req.userId,
            product: product,
            amount: data.amount
        }

        const serverOrder = await purchaseService.createSingleOrder(orderData);

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

async function completeSinglePurchase(req, res) {
    try {
        const { arttype, artnr, amount, paypalOrderId } = req.body
        const userId = req.userId

        let productObject = {
            arttype: arttype,
            artnr: artnr,
            amount: amount
        }

        const orderDB = await purchaseService.saveSingleOrder(userId, productObject, paypalOrderId)
        
        if (!orderDB) {
            return res.status(500).json({ message: 'Bestellung konnte nicht abgeschlossen werden.' })
        }
        
        // 1. Download der Rechnung als PDF
        const newInvoicePdf = await invoiceService.newInvoice(orderDB.orderId)
        console.log('Neue Rechnung wurde erstellt!')
        
        // 2. Versenden einer E-Mail mit Rechnung im Anhang
        const sendMail = await mailUtility.sendMail(userId, orderDB.orderId)
        console.log(sendMail)
        
        if (sendMail.code === 200) {
            console.log('Mail wurde versendet!')
            return res.status(200).json({ message: 'Purchase erfolgreich abgeschlossen', orderDB: orderDB })
        }
        
        return res.status(200).json({ message: 'Einzelkauf erfolgreich abgeschlossen', orderDB: orderDB })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Einzelkauf fehlgeschlagen.', error: error.message })
    }
}

async function createCartPurchase(req, res) {
    try {
        const data = req.body.data || req.body;
        const { userId, code } = data;
        const paypalOrderObject = await purchaseService.createCartOrder(userId, code);

        if (!paypalOrderObject) {
            return res.status(500).json({ error: "Konnte PayPal Order nicht berechnen" });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody(paypalOrderObject);

        const order = await paypalClient.execute(request);
        res.status(200).json({ id: order.result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Es gab einen Fehler beim Erstellen des Kaufs.' })
    }
}

async function completeCartPurchase(req, res) {
    try {
        const { userId, paypalOrderId } = req.body
        const orderDB = await purchaseService.completeCartOrder(userId, paypalOrderId)
        console.log('OrderDB:', orderDB)
        
        if (!orderDB) {
            return res.status(500).json({ message: 'Bestellung konnte nicht abgeschlossen werden.' })
        }
        
        // 1. Download der Rechnung als PDF
        const newInvoicePdf = await invoiceService.newInvoice(orderDB.orderId)
        console.log('Neue Rechnung wurde erstellt!')
        
        // 2. Versenden einer E-Mail mit Rechnung im Anhang
        const sendMail = await mailUtility.sendMail(userId, orderDB.orderId)

        if (sendMail.code === 200) {
            console.log('Mail wurde versendet!')
            return res.status(200).json({ message: 'Purchase erfolgreich abgeschlossen', orderDB: orderDB })
        }
        
        return res.status(200).json({ message: 'Purchase erfolgreich abgeschlossen, aber keine Mail gesendet.', orderDB: orderDB })
    } catch (error) {
        console.error("Fehler in completeCartPurchase:", error);
        res.status(500).json({ message: 'Es gab einen Fehler beim Abschließen des Kaufs.', error: error.message })
    }
}

async function getInvoice(req, res) {
    try {
        const { orderId } = req.params
        const invoive = await invoiceService.newInvoice(orderId)
        if (invoive.code === 200) {
            res.download(invoive.path, `domfacetten-${orderId}.pdf`, (err) => {
                if (err) {
                    console.error("Fehler beim Senden der Datei:", err);
                    res.status(500).json({ message: 'Fehler beim Senden der Datei.' });
                }
            });
        } else {
            res.status(500).json({ message: invoive.message || 'Fehler beim Erstellen der Rechnung.' })
        }

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports = { createSinglePurchase, completeSinglePurchase, createCartPurchase, completeCartPurchase, getInvoice };