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
                    ${
                        product.image2
                            ? `
                        <button class="arrow-left">〈</button>
                        <button class="arrow-right">⟩</button>
                    `
                            : ""
                    }
                </div>
            </div>

            <div class="highlight-product-info">
                <h2 class="product-name">${product.name} <span class ="artnr">(${product.arttype}${product.artnr})</span></h2>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ""}
                <p class="product-price">${product.price},00 €</p>
                <p class ="text">*inkl. MwSt. zzgl. Versandkosten</p>
                <label class ="text">Menge: <input type="number" min="1" max = "5" value="1" step="1"></label>
                <button class="addToCart" popovertarget="addToCartPopover">In den Warenkorb legen</button>
                <button class ="buyNow">Jetzt bestellen!</button>
            </div>

            <div popover id="addToCartPopover">
                <h2>Kurze Info</h2>
                <p>Aktuell steht die Warenkorb-Funktion noch unter Bearbeitung. Sie wird aber in Kürze verfügbar sein :)</p>
            </div>
        `;

        const caroussel = document.querySelector(".img-caroussel");
        const arrowLeft = document.querySelector(".arrow-left");
        const arrowRight = document.querySelector(".arrow-right");

        arrowRight.addEventListener("click", () => {
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

        arrowLeft.addEventListener("click", () => {
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
    } catch (error) {
        console.log(error);
    }
});
