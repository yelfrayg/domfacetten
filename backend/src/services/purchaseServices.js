const createOrder = async (productObject, amount) => {
    try {
        let totalAmount = productObject.price * amount; 
        if(totalAmount < 15) {
            totalAmount += 1.19; // Ab 15€ ist Versandkostenfrei, darunter 1.19€ Versandkosten
        }
        console.log('Creating PayPal order with Product: ' + productObject.name + ' and Amount: ' + totalAmount);
        return {
            intent: 'SERVER_ORDER',
            purchase_units: [{
                reference_id: productObject.arttype + productObject.artnr,
                amount: {
                    currency_code: "EUR",
                    amount: amount,
                    singleValue: parseInt(productObject.price.toFixed(2)),
                    totalValue: parseInt(totalAmount.toFixed(2))
                }
            }]
        }
    } catch (error) {
        console.log('Paypal Fehler:', error);
    }
};

module.exports = {
    createOrder,
};