const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

const createOrder = async (productObject, amount) => {
    try {
        const itemTotal = productObject.price * amount;
        let shippingStr = "0.00";
        let totalAmount = itemTotal;
        if (totalAmount < 39) {
            totalAmount += 1.55; // Ab 39€ ist Versandkostenfrei, darunter 1.55€ Versandkosten
            shippingStr = "1.55";
        }
        console.log('Creating PayPal order with Product: ' + productObject.name + ' and Amount: ' + totalAmount);
        return {
            intent: 'SERVER_ORDER',
            purchase_units: [{
                reference_id: productObject.arttype + productObject.artnr,
                amount: {
                    currency_code: "EUR",
                    amount: amount,
                    singleValue: productObject.price.toFixed(2),
                    itemTotalValue: itemTotal.toFixed(2),
                    shippingValue: shippingStr,
                    totalValue: totalAmount.toFixed(2)
                }
            }]
        }
    } catch (error) {
        console.log('Paypal Fehler:', error);
    }
};

const saveOrder = async (data) => {
    try {
        const { orderId, customerId, products } = data
        const now = new Date()
        return await prisma.orders.create({
            data: {
                orderId: orderId,
                customerId: customerId,
                products: products,
                timestamp: now
            }
        })
    } catch (error) {
        console.error('Fehler beim Speichern der Bestellung:', error.message);
        console.error('Details:', error);
        return {
            code: 500,
            message: 'Fehler beim Speichern der Bestellung.',
            error: error.message
        }
    }
}

const createCartOrder = async (userId) => {
    try {
        const allProductsInCart = await prisma.cart.findMany({
            where: {
                userId: userId,
            },
            include: {
                product: true
            }
        })

        if (!allProductsInCart || allProductsInCart.length === 0) {
            console.log('Warenkorb ist leer');
            return null;
        }

        let itemTotal = allProductsInCart.reduce((sum, cartItem) => {
            return sum + (Number(cartItem.product.price) * cartItem.quantity)
        }, 0)

        let shippingFee = 0
        let totalPrice = itemTotal

        if (totalPrice < 39) { // kleiner als 39€ kostet Versand
            shippingFee += 1.55
            totalPrice += 1.55
        }

        // PAYPAL INTENT
        const paypalOrder = {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: `CART-${userId}-${Date.now()}`,
                amount: {
                    currency_code: "EUR",
                    value: totalPrice.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: "EUR",
                            value: itemTotal.toFixed(2)
                        },
                        shipping: {
                            currency_code: "EUR",
                            value: shippingFee.toFixed(2)
                        }
                    }
                }
            }]
        }

        return paypalOrder
    } catch (error) {
        console.error('Fehler beim Erstellen der Cart Order:', error);
        return null;
    }
}

const completeCartOrder = async (userId, paypalOrderId) => {
    try {
        return await prisma.$transaction(async tx => {
            const allProductsInCart = await tx.cart.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    product: true
                }
            })

            if (!allProductsInCart.length) {
                throw new Error("Warenkorb leer oder bereits abgerechnet");
            }

            // 2. Erstelle die Bestellung in der Datenbank
            const orderDB = await tx.orders.create({
                data: {
                    orderId: paypalOrderId, // Die tatsächliche PayPal Order ID (wird vom Frontend/PayPal übergeben)
                    products: allProductsInCart, // Speichert die Produkte direkt im JSON-Format
                    customerId: userId
                }
            })

            // 3. Leere den Warenkorb
            await tx.cart.deleteMany({
                where: {
                    userId: userId
                }
            })

            return orderDB
        })
    } catch (error) {
        console.error('Transaktionsfehler beim Abschließen der Bestellung:', error);
        return {
            code: 500,
            message: 'Bestellung konnte nicht abgeschlossen werden.'
        }
    }
}

module.exports = {
    createOrder,
    saveOrder,
    createCartOrder,
    completeCartOrder
};