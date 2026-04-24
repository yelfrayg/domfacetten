window.addEventListener("productLoaded", (e) => {
    const buyNowBtn = document.querySelector(".buyNow");
    let { arttype, artnr } = e.detail;
    let amount = 1;

    paypal
        .Buttons({
            createOrder: function () {
                amount = Number(document.getElementById("amount").value);
                if (!Number.isFinite(amount) || amount < 1 || amount > 5) {
                    alert("Bitte geben Sie eine Menge zwischen 1 und 5 ein.");
                    return;
                }
                return fetch(
                    "http://localhost:3000/api/purchases/newPurchase",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            data: {
                                arttype: arttype,
                                artnr: artnr,
                                amount: amount,
                            },
                        }),
                    },
                )
                    .then(function (res) {
                        if (!res.ok) {
                            return res
                                .json()
                                .then((json) => Promise.reject(json));
                        }
                        console.log("Bestellung erfolgreich erstellt:", res);
                        return res.json();
                    })
                    .then(({ id }) => {
                        return id;
                    })
                    .catch((error) => {
                        console.error(
                            "Fehler beim Erstellen der Bestellung:",
                            error,
                        );
                        alert(
                            "Hmm. Anscheinend ist der Server gerade am Schlafen. Bitte versuchen Sie es später erneut :)",
                        );
                    });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(async function (details) {
                    let orderedProducts = [];
                    details.purchase_units.forEach((unit) => {
                        unit.items.forEach((item) => {
                            orderedProducts.push({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.unit_amount.value,
                            });
                        });
                    });

                    let customerDetails = details.payer
                    customerDetails.address = details.purchase_units[0].shipping.address;
                    
                    let orderDetails = {
                        orderId: details.id,
                        customerDetails: customerDetails,
                        products: { orderedProducts },
                    };
                    console.log(details);

                    try {
                        const req = await fetch(
                            "http://localhost:3000/api/purchases/savePurchase",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(orderDetails),
                            },
                        );
                        const res = await req.json();
                        if (res.ok) {
                            alert("Alles hat geklappt!");
                            return;
                        }
                        // window.location = '/product.html?id=' + artnr
                    } catch (error) {
                        console.log(
                            "Es gab einen Fehler beim Speichern der Bestellung",
                        );
                    }
                });
            },
        })
        .render("#paypal");
});
