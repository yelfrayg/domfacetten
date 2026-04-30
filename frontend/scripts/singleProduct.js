const url = new URL(window.location.href);
const artnr = url.searchParams.get("id");
const productContainer = document.querySelector(".highlight-product-container");

if (!artnr) {
    window.location.href = "./index.html";
}

document.addEventListener("DOMContentLoaded", async (_) => {
    try {
        if (!productContainer) return;

        const artnrNum = parseInt(String(artnr), 10);
        if (!Number.isFinite(artnrNum)) {
            window.location.href = "./index.html";
            return;
        }

        const req = await fetch("http://localhost:3000/api/products");
        const res = await req.json();
        const product = (res.products || []).find(
            (p) => Number(p.artnr) === artnrNum,
        );

        if (!product) {
            productContainer.innerHTML = `
                <h2>Produkt nicht gefunden.</h2>
            `;
            return;
        }

        productContainer.innerHTML = `
            <div class="highlight-product-imgs">
                <ul class="img-caroussel">
                    <li class="img-container"><img src="http://localhost:3000/uploads/products/${encodeURIComponent(product.heroImage)}" alt=""></li>
                    ${product.image2 ? `<li class="img-container"><img src="http://localhost:3000/uploads/products/${encodeURIComponent(product.image2)}" alt=""></li>` : ""}
                    ${product.image3 ? `<li class="img-container"><img src="http://localhost:3000/uploads/products/${encodeURIComponent(product.image3)}" alt=""></li>` : ""}
                </ul>
                <div class="arrow-container">
                    ${product.image2
                ? `
                        <button class="arrow-left">〈</button>
                        <button class="arrow-right">⟩</button>
                    `
                : ""
            }
                </div>
            </div>

            <div class="highlight-product-info">
                <h2 class="product-name">${product.name} <span class ="artnr">(${product.arttype}${String(product.artnr).padStart(3, "0")})</span></h2>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ""}
                <p class="product-price">${product.price},00 €</p>
                <p class ="text">*inkl. MwSt. zzgl. Versandkosten</p>
                <label class ="text">Menge: <input id="amount" type="number" min="1" max = "5" value="1" step="1"></label>
                <button class="addToCart" id="cart-button" data-arttype="${product.arttype}" data-artnr="${product.artnr}">In den Warenkorb legen</button>
                <button class ="buyNow" id="buyNow"><div id="paypal"></div></button>
            </div>
        `;

        dispatchEvent(
            new CustomEvent("productLoaded", {
                detail: {
                    arttype: product.arttype,
                    artnr: product.artnr,
                },
            }),
        );

        const caroussel = document.querySelector(".img-caroussel");
        const arrowLeft = document.querySelector(".arrow-left");
        const arrowRight = document.querySelector(".arrow-right");

        arrowRight?.addEventListener("click", () => {
            // Wenn wir am Ende sind, scrollen wir zum Anfang (optionaler Loop)
            if (
                caroussel.scrollLeft + caroussel.offsetWidth >=
                caroussel.scrollWidth
            ) {
                caroussel.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                caroussel.scrollBy({
                    left: caroussel.offsetWidth,
                    behavior: "smooth",
                });
            }
        });

        arrowLeft?.addEventListener("click", () => {
            // Wenn wir am Anfang sind, scrollen wir zum Ende (optionaler Loop)
            if (caroussel.scrollLeft <= 0) {
                caroussel.scrollTo({
                    left: caroussel.scrollWidth,
                    behavior: "smooth",
                });
            } else {
                caroussel.scrollBy({
                    left: -caroussel.offsetWidth,
                    behavior: "smooth",
                });
            }
        });

        const cartButton = document.getElementById("cart-button");
        console.log("Cart button:", cartButton);


        cartButton?.addEventListener("click", async (e) => {
            if (!localStorage.getItem("userId")) {
                return;
            }
            const userId = localStorage.getItem("userId");

            let data = {
                productId: parseInt(artnr),
                userId: userId,
                quantity: Number(document.getElementById("amount").value) || 1,
            };

            await addItem(data)
        });
    } catch (error) {
        console.log(error);
    }
});

async function addItem(data) {
    const bag = document.querySelector(".bag");
    console.log("Adding to cart:", bag);
    if (bag) {
        bag.classList.remove("wiggle");
        void bag.offsetWidth;
        bag.classList.add("wiggle");

        bag.addEventListener(
            "animationend",
            () => {
                console.log("Animation beendet!");
            },
            { once: true },
        );
    } else {
        console.error("Bag element not found!");
    }

    try {
        const req = await fetch(
            "http://localhost:3000/api/cartManagement/addCartItems",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("userToken") || ""
                },
                body: JSON.stringify(data),
            },
        );
        const res = await req.json();
        if(res.message === 'Artikel bereits vorhanden.') await removeItem(data)
        console.log(res);
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

async function removeItem(data) {
    try {
        const req = await fetch('http://localhost:3000/api/cartManagement/removeItem', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("userToken") || ""
            },
            body: JSON.stringify({ data })
        })
        const res = await req.json()
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}