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
        if(totalAmount < 39) {
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
        const { orderId, customerDetails, products } = data
        const now = new Date()
        return await prisma.orders.create({
            data: {
                orderId: orderId,
                customerDetails: customerDetails,
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

module.exports = {
    createOrder,
    saveOrder
};