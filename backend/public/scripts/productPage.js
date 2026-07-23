const filters = document.querySelectorAll("#checkmark");
const productContainer = document.querySelector(".products-container");
const filter = document.querySelector(".filter");
const filterMobile = document.querySelector(".filter-mobile");
const heading = document.querySelector(".products-container");

document.addEventListener("DOMContentLoaded", async (_) => {
    await fetchProducts();


    let selectedColors = []

    filters.forEach((f) => {
        f.addEventListener('click', _ => {
            const colorValue = f.getAttribute("data-value");
            if (!selectedColors.includes(colorValue)) {
                selectedColors.push(colorValue);
            }
            else {
                selectedColors = selectedColors.filter((c) => c !== colorValue);
            }
            const allProducts = document.querySelectorAll(".product");
            console.log(selectedColors);
            if (selectedColors.length === 0) {
                allProducts.forEach((p) => {
                    p.style.display = "block";
                })
                return
            }
            allProducts.forEach((p) => {
                if (selectedColors.every((color) => p.getAttribute("data-colors").includes(color))) {
                    p.style.display = "block";
                }
                else {
                    p.style.display = 'none'
                }
            })
        })
    });
});

async function fetchProducts() {
    try {
        const req = await fetch(`/api/products`);
        const res = await req.json();
        allproductsArray = res.products || [];
        console.log(allproductsArray);
        const productContainer = document.querySelector(".productPage-container");

        allproductsArray.forEach((p) => {
            const productElement = document.createElement("a");
            productElement.classList.add("product");
            console.log(p.keywords.join(','));
            let colors = []
            p.keywords.forEach((keyword) => {
                colors.push(keyword.toLowerCase());
            });
            console.log(colors);
            productElement.setAttribute("data-colors", colors);
            if (p.inStock <= 0) {
                productElement.classList.add("out-of-stock");
            }
            else {
                productElement.href = `./product/${String(p.artnr).padStart(3, '0')}`;
            }

            productElement.innerHTML = `
                <div class="product-img-container">
                    <img src="/uploads/products/${p.heroImage}" alt="Stoffarmband">
                    <span class="product-nr">${p.arttype}${String(p.artnr).padStart(3, '0')}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-price">${parseFloat(p.price).toFixed(2).replace('.', ',')} €</p>
                </div>
            `;
            productContainer.appendChild(productElement);
        })

    } catch (error) {
        heading.innerHTML = "<h3>Hmm, anscheinend möchte der Server grade nicht arbeiten...<br>Wir arbeiten aktuell an einer Lösung!</h3>";
        filter.style.display = "none";
        filterMobile.style = "display: none !important";
    }
}