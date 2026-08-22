const url = new URL(window.location.href);
//Suche den letzten Parameter in der Url = localhost:3000/product/1234

const artnr = url.pathname.split('/').pop();
const productContainer = document.querySelector(".highlight-product-container");
const userId = localStorage.getItem("userId")


if (!artnr) {
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", async (_) => {
    try {
        if (!productContainer) return;

        const artnrNum = parseInt(String(artnr), 10);
        if (!Number.isFinite(artnrNum)) {
            window.location.href = "./index.html";
            return;
        }

        const req = await fetch(`/api/products/${artnr}`);
        const res = await req.json();
        console.log(res);

        if (res.status === 'FAILURE') {
            console.log('Fehler beim Abrufen des Produkts:', res.message || 'Unbekannter Fehler');
            productContainer.innerHTML = `
                <div class="error-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M78-206v-510h74v510H78Zm110 0v-510h74v510h-74Zm110 0v-510h36v510h-36Zm110 0v-510h72v510h-72Zm110 0v-510h110v510H518Zm146 0v-510h36v510h-36Zm110 0v-510h110v510H774Z"/></svg>
                    <h1>Produkt nicht gefunden.</h1>
                </div>
            `;
            return;
        }
        const product = res.data.reqData || []

        if (product.inStock <= 0) {
            productContainer.innerHTML = `
                <div class="error-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M78-206v-510h74v510H78Zm110 0v-510h74v510h-74Zm110 0v-510h36v510h-36Zm110 0v-510h72v510h-72Zm110 0v-510h110v510H518Zm146 0v-510h36v510h-36Zm110 0v-510h110v510H774Z"/></svg>
                    <h1>Produkt nicht gefunden.</h1>
                </div>
            `;
            return;
        }

        productContainer.innerHTML = `
            <div class="highlight-product-imgs">
                <ul class="img-caroussel">
                    <li class="img-container"><img src="/uploads/products/${encodeURIComponent(product.heroImage)}" alt="" loading="lazy"></li>
                    ${product.image2 ? `<li class="img-container"><img src="/uploads/products/${encodeURIComponent(product.image2)}" alt="" loading="lazy"></li>` : ""}
                    ${product.image3 ? `<li class="img-container"><img src="/uploads/products/${encodeURIComponent(product.image3)}" alt="" loading="lazy"></li>` : ""}
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
                <p class="product-price">${parseFloat(product.price).toFixed(2).replace('.', ',')} €</p>
                <p class ="text">*inkl. MwSt. zzgl. Versandkosten</p>
                <div class="product-quantity-wrapper">
                    <div class="text">
                        <label for="amount">Menge:</label>
                        <input id="amount" type="number" min="1" max = ${product.inStock} value="1" step="1"/>
                    </div>
                    ${(product.inStock > 0) && (product.inStock < 8) ? `<p class="inStock-warning">(Nur noch ${product.inStock} Stück auf Lager!)</p>` : ""}
                </div>
                <button class="addToCart" id="cart-button" data-arttype="${product.arttype}" data-artnr="${product.artnr}"><div class="loaderCode"></div></button>
                <button class ="buyNow" id="buyNow">Jetzt kaufen!</button>
            </div>
        `;

        const buyBtn = document.getElementById("buyNow");
        buyBtn?.addEventListener("click", async (e) => {
            // Wenn das Item noch nicht im Cart ist, wird es hinzugefügt und dann zu /cart weitergeleitet
            if (!localStorage.getItem("userId")) {
                window.location.href = "/userAuth?msg=403";
                return;
            }
            // Wenn das Item bereits im Cart ist, wird ohne es zu adden ein direct zu /cart durchgeführt
            if (buyBtn.dataset.isInCart === "true") {
                window.location.href = "/cart";
                return;
            }
            const userId = localStorage.getItem("userId");
            const userQuantity = parseInt(document.getElementById("amount").value, 10);
            const maximum = parseInt(document.getElementById("amount").max, 10);
            if (userId && userQuantity > 0 && userQuantity <= maximum) {
                let data = {
                    productId: parseInt(artnr),
                    userId: userId,
                    quantity: userQuantity,
                };
                await addItem(data);
                window.location.href = "/cart";
                return
            }
        })

        // <div id="paypal"></div> in Zeile 60

        dispatchEvent(
            new CustomEvent("productLoaded", {
                detail: {
                    arttype: product.arttype,
                    artnr: product.artnr,
                },
            }),
        );

        await findItem(userId, artnr)

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

        let cartButton = document.getElementById("cart-button");
        // console.log("Cart button:", cartButton);

        cartButton?.addEventListener("click", async (e) => {
            if (!localStorage.getItem("userId")) {
                window.location.href = "/userAuth?msg=403";
                return;
            }
            const userId = localStorage.getItem("userId");

            const userQuantity = parseInt(document.getElementById("amount").value, 10);
            const maximum = parseInt(document.getElementById("amount").max, 10);

            let data = {
                productId: parseInt(artnr),
                userId: userId,
                quantity: userQuantity,
            };

            if (cartButton.dataset.isInCart === "true") {
                await removeItem(data);
                cartButton.textContent = 'In den Warenkorb legen';
                cartButton.dataset.isInCart = "false";
            } else {
                if (userQuantity > maximum || userQuantity < 1) {
                    document.getElementById("amount").value = maximum;
                    return
                }
                await addItem(data);
                cartButton.textContent = 'Artikel aus Warenkorb entfernen';
                cartButton.dataset.isInCart = "true";
            }
        });
    } catch (error) {
        console.log(error);
    }
});

async function addItem(data) {
    const bag = document.querySelector(".bag");
    console.log("Adding to cart:", bag);
    if (bag) {
        // Remove the wiggle class if it exists
        bag.classList.remove("wiggle");

        // Force a reflow to reset the animation
        void bag.offsetWidth;

        // Add a small delay to ensure the animation plays
        setTimeout(() => {
            bag.classList.add("wiggle");
            console.log("Animation gestartet!");
        }, 10);

        bag.addEventListener(
            "animationend",
            () => {
                console.log("Animation beendet!");
                bag.classList.remove("wiggle");
            },
            { once: true },
        );
    } else {
        console.error("Bag element not found!");
    }

    try {
        const req = await fetch(
            "/api/cartManagement/addCartItems",
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
        console.log(res);
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

async function removeItem(data) {
    let bag = document.querySelector(".bag");
    console.log("Adding to cart:", bag);
    if (bag) {
        // Remove the throw class if it exists
        bag.classList.remove("throw");

        // Force a reflow to reset the animation
        void bag.offsetWidth;

        // Add a small delay to ensure the animation plays
        setTimeout(() => {
            bag.classList.add("throw");
            console.log("Animation gestartet!");
        }, 10);

        bag.addEventListener(
            "animationend",
            () => {
                console.log("Animation beendet!");
                bag.classList.remove("throw");
            },
            { once: true },
        );
    } else {
        console.error("Bag element not found!");
    }
    try {
        const req = await fetch('/api/cartManagement/removeItem', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("userToken") || ""
            },
            body: JSON.stringify(data)
        })
        const res = await req.json()
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

async function findItem(userId, artnr) {
    // Nur wenn User eingeloggt ist
    if (!userId || !artnr) {
        console.log('User nicht eingeloggt oder Produkt-ID fehlt.');
        return;
    }

    try {
        const data = {
            userId: userId,
            productId: parseInt(artnr)
        }

        const req = await fetch(
            "/api/cartManagement/findItem",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("userToken") || ""
                },
                body: JSON.stringify(data),
            },
        );

        if (!req.ok) {
            const cartButton = document.getElementById("cart-button");
            if (cartButton) {
                cartButton.textContent = 'In den Warenkorb legen';
                cartButton.dataset.isInCart = "false";
            }
            return;
        }

        const res = await req.json();
        const cartItem = res?.data?.reqData?.item ?? null;
        const cartButton = document.getElementById("cart-button");
        const amountInput = document.getElementById("amount");

        if (!cartButton) return;

        if (cartItem) {
            cartButton.textContent = 'Artikel aus Warenkorb entfernen';
            if (amountInput && typeof cartItem.quantity === 'number') {
                amountInput.value = cartItem.quantity;
            }
            cartButton.dataset.isInCart = "true";
        } else {
            cartButton.textContent = 'In den Warenkorb legen';
            cartButton.dataset.isInCart = "false";
        }
    } catch (error) {
        console.error('findItem Error:', error);
    }
}