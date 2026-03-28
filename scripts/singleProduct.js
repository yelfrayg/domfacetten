const url = new URL(window.location.href);
const artnr = url.searchParams.get("id");
const productContainer = document.querySelector(".highlight-product-container");

if(!artnr) {
    window.location.href = "./index.html";
}

document.addEventListener("DOMContentLoaded", async (_) => {
    try {
        const req = await fetch("./scripts/products/products.json");
        const res = await req.json();
        const product = res.products.find((p) => p.artnr === artnr);
        productContainer.innerHTML = `
            <div class="highlight-product-imgs">
                <ul class="img-caroussel">
                ${product.images.map((img) => {
                    return `<li class="img-container"><img src="${img}" alt=""></li>`;
                }).join("")}
                </ul>
                <div class="arrow-container">
                    <button class="arrow-left">〈</button>
                    <button class="arrow-right">⟩</button>
                </div>
            </div>

            <div class="highlight-product-info">
                <h2 class="product-name">${product.name} <span class ="artnr">(${product.artnr})</span></h2>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price},00 €</p>
                <p class ="text">*inkl. MwSt. zzgl. Versandkosten</p>
                <p class ="text">Menge: 1 Stck.</p>
                <button class="addToCart">In den Warenkorb legen</button>
                <button class ="buyNow">Jetzt bestellen!</button>
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
