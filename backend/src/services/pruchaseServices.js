const paypal = require("@paypal/checkout-server-sdk");
const payPalToken = require('../middleware/checkAuth')

const createOrder = async (productObject, amount) => {
    try {
        let totalAmount = productObject.price * amount; // Berechnung des Gesamtbetrags
        if(totalAmount < 15) {
            totalAmount += 1.19; // Mindestbetrag von 15 Euro
        }
        console.log(totalAmount)
        // const req = await fetch(
        //     "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        //     {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             Authorization: `Bearer ${await getPayPalAccessToken()}`, // Hilfsfunktion für Token
        //         },
        //         body: JSON.stringify({
        //             intent: "CAPTURE",
        //             purchase_units: [
        //                 {
        //                     reference_id: productObject.artNr,
        //                     amount: {
        //                         currency_code: "EUR",
        //                         value: totalAmount,
        //                     },
        //                 },
        //             ],
        //         }),
        //     },
        // );
        // const order = await req.json();
        return Math.random()
    } catch (error) {
        console.log('Paypal Fehler:', error);
    }
};

module.exports = {
    createOrder,
};
