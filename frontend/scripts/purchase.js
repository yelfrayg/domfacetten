window.addEventListener("productLoaded", (e) => {
    const buyNowBtn = document.querySelector(".buyNow");
    let { arttype, artnr } = e.detail;
    let amount = 1

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
                            "Es gab ein Problem bei der Bestellung. Bitte versuchen Sie es später erneut.",
                        );
                    });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    
                    window.location.href = "/index.html";
                });
            },
        })
        .render("#paypal");
});
