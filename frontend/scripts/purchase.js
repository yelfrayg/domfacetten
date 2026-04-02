window.addEventListener("productLoaded", (e) => {
    const buyNowBtn = document.querySelector(".buyNow");
    let { arttype, artnr } = e.detail;

    buyNowBtn.addEventListener("click", async (_) => {
        const count = Number(document.getElementById("amount").value);
        if (!Number.isFinite(count) || count < 1 || count > 5) {
            alert("Bitte geben Sie eine Menge zwischen 1 und 5 ein.");
            return;
        }
        console.log(
            `Produkt ${arttype + artnr} soll ${Math.round(count)} Mal bestellt werden!`,
        );

        const orderData = {
            data: {
                arttype,
                artnr,
                amount: Math.round(count),
            },
        };

        try {
            const req = await fetch(
                "http://localhost:3000/api/purchases/newPurchase",
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
                },
            );

            if (!req.ok) {
                const fallbackText = await req.text().catch(() => "");
                console.log("Bestellung fehlgeschlagen:", req.status, fallbackText);
                alert(
                    "Es gab ein Problem bei der Bestellung. Bitte versuchen Sie es später erneut.",
                );
                return;
            }

            const res = await req.json().catch(() => ({}));
            if (res.id) {
                console.log('Paypal Order ID erhalten', res.id)
            } else {
                alert(
                    "Es gab ein Problem bei der Bestellung. Bitte versuchen Sie es später erneut.",
                );
            }
        } catch (error) {
            console.log("Fehler bei der Bestellung:", error);
            alert(
                "Es gab ein Problem bei der Bestellung. Bitte versuchen Sie es später erneut.",
            );
        }
    });
});
