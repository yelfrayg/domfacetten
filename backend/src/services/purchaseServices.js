const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const path = require('path')

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

const createSingleOrder = async (data) => {
    try {
        const { userId, product, amount } = data
        
        if (!userId || !product || !amount) {
            console.log('Ein wichtiges Detail fehlt!');
            return null;
        }

        let itemTotal = product.price * amount
        let shippingFee = 0
        let totalPrice = itemTotal

        if (totalPrice < 39) {
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
                    totalValue: totalPrice.toFixed(2),
                    itemTotalValue: itemTotal.toFixed(2),
                    shippingValue: shippingFee.toFixed(2),
                    singleValue: product.price.toFixed(2),
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
};

const saveSingleOrder = async (userId, productObj, paypalOrderId) => {
    try {
        return await prisma.$transaction(async tx => {
            const { arttype, artnr, amount } = productObj

            const product = await tx.product.findFirst({
                where: {
                    arttype: arttype,
                    artnr: artnr
                }
            })

            let productDataForOrders = [{
                userId: userId,
                product: product,
                quantity: amount
            }]

            const orderDB = await tx.orders.create({
                data: {
                    orderId: paypalOrderId, 
                    products: productDataForOrders, 
                    // code: code, // Optional: Wenn ein Rabattcode verwendet wurde, kann dieser hier gespeichert werden
                    customerId: userId
                }
            })

            return orderDB
        })
    } catch (error) {
        console.error('Transaktionsfehler beim Abschließen der Bestellung:', error);
        return null
    }
}

const createCartOrder = async (userId, code) => {
    try {
        const allProductsInCart = await prisma.cart.findMany({
            where: {
                userId: userId,
            },
            include: {
                product: true
            }
        })

        const codeValue = await prisma.codes.findFirst({
            where: {
                codeId: code.toUpperCase()
            }
        })

        console.log(`Query Ergebnis:`, codeValue || 'Kein Code gefunden')

        let discountValue = 0
        if(codeValue && codeValue.expired == true) {
            console.log(`Code ${code} ist abgelaufen!`)
            discountValue = 0
        }
        else {
            discountValue = codeValue ? codeValue.codeValue : 0
        }

        if (!allProductsInCart || allProductsInCart.length === 0) {
            console.log('Warenkorb ist leer');
            return null;
        }

        let itemTotal = allProductsInCart.reduce((sum, cartItem) => {
            return sum + (Number(cartItem.product.price) * cartItem.quantity)
        }, 0)

        let shippingFee = 0
        let discountedItemTotal = parseFloat(itemTotal * (1 - discountValue))
        let totalPrice = discountedItemTotal

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
                            value: discountedItemTotal.toFixed(2)
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
        return null
    }
}

module.exports = {
    createSingleOrder,
    saveSingleOrder,
    createCartOrder,
    completeCartOrder
};