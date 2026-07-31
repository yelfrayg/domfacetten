const productContainer = document.querySelector(".products-container");
const filter = document.querySelector(".filter");
const filterMobile = document.querySelector(".filter-mobile");

document.addEventListener("DOMContentLoaded", async (_) => {
    await fetchProducts();

    let selectedColors = []

    document.addEventListener('change', event => {
        if (!event.target.matches('input[name="checkmark"]')) {
            return;
        }

        const colorValue = event.target.getAttribute("data-value");

        if (event.target.checked) {
            if (!selectedColors.includes(colorValue)) {
                selectedColors.push(colorValue);
            }
        }
        else {
            selectedColors = selectedColors.filter((c) => c !== colorValue);
        }

        const allProducts = document.querySelectorAll(".product");
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
    });
});

async function fetchProducts() {
    try {
        const req = await fetch(`/api/products`);
        const res = await req.json();
        allproductsArray = res.products || [];
        console.log("Fetched products:", allproductsArray);

        allproductsArray
            .sort((a, b) => a.artnr - b.artnr)
            .forEach((p) => {
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
                    <img src="/uploads/products/${p.heroImage}" alt="Stoffarmband" loading="lazy">
                    <span class="product-nr">${p.arttype}${String(p.artnr).padStart(3, '0')}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-price">${parseFloat(p.price).toFixed(2).replace('.', ',')} €</p>
                    ${(p.inStock <= 8 && p.inStock != 0) ? `<p class="product-warning">Nur noch ${p.inStock} Stück auf Lager!</p>` : ""}
                </div>
            `;
                productContainer.appendChild(productElement);
            })

        createFilters(allproductsArray);

    } catch (error) {
        productContainer.innerHTML = "<h3>Hmm, anscheinend möchte der Server grade nicht arbeiten...<br>Wir arbeiten aktuell an einer Lösung!</h3>";
        filter.style.display = "none";
        filterMobile.style = "display: none !important";
    }
}

function createFilters(products) {
    const filterContainers = document.querySelectorAll(".filters");
    let filters = []
    console.log("Products for filter creation:", products);
    console.log('Container geleert.')

    filterContainers.forEach((filterContainer) => {
        filterContainer.innerHTML = "";
    })

    products.forEach((p) => {
        p.keywords.forEach((keyword) => {
            console.log("Creating filter for keyword:", keyword);
            // TODO: Implementiere eine Überprüfung, um Duplikate zu vermeiden
            if (!filters.includes(keyword)) {
                filters.push(keyword);
            }
        })
    })

    filters.forEach((filter) => {
        filterContainers.forEach((filterContainer) => {
            const filterElement = document.createElement("li");
            filterElement.classList.add("filter-object-wrapper");
            filterElement.innerHTML = `
                <span class="filter-object">
                                    <p>${filter}</p>
                                    <input
                                        type="checkbox"
                                        name="checkmark"
                                        id="checkmark"
                                        data-value="${filter.toLowerCase()}"
                                    />
                                </span>
            `;
            filterContainer.appendChild(filterElement);
        })
    })
}