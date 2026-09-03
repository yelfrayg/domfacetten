const productContainer = document.querySelector(".products-container");
const filter = document.querySelector(".filter");
const filterMobile = document.querySelector(".filter-mobile");

document.addEventListener("DOMContentLoaded", async (_) => {
    await fetchProducts();

    let selectedFilters = [];

    document.addEventListener("click", (event) => {
        const filterButton = event.target.closest(".filter-object-button");
        if (!filterButton) {
            return;
        }

        const filterValue = filterButton.getAttribute("data-value");
        if (selectedFilters.includes(filterValue)) {
            selectedFilters = selectedFilters.filter((value) => value !== filterValue);
        }
        else {
            selectedFilters.push(filterValue);
        }

        document.querySelectorAll(`.filter-object-button[data-value="${filterValue}"]`)
            .forEach((button) => {
                const isSelected = selectedFilters.includes(filterValue);
                button.classList.toggle("selected", isSelected);
                button.setAttribute("aria-pressed", String(isSelected));
            });

        const allProducts = document.querySelectorAll(".product");
        if (selectedFilters.length === 0) {
            allProducts.forEach((p) => {
                p.style.display = "block";
            })
            return
        }

        allProducts.forEach((p) => {
            const productFilters = p.getAttribute("data-colors").split(",");
            if (selectedFilters.every((value) => productFilters.includes(value))) {
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
        // console.log(res);
        allproductsArray = res.data.reqData || [];

        allproductsArray
            .sort((a, b) => a.artnr - b.artnr)
            .forEach((p) => {
                const productElement = document.createElement("a");
                productElement.classList.add("product");
                let colors = []
                p.keywords.forEach((keyword) => {
                    colors.push(keyword.toLowerCase());
                });
                productElement.setAttribute("data-colors", colors.join(","));
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
                // Nur wenn das Bild geladen ist, wird das Produkt angezeigt
                
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

    filterContainers.forEach((filterContainer) => {
        filterContainer.innerHTML = "";
    })

    products.forEach((p) => {
        p.keywords.forEach((keyword) => {
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
                    <button class="filter-object-button" name="checkmark"
                        type="button"
                        data-value="${filter.toLowerCase()}"
                        aria-pressed="false"
                        aria-label="Filter ${filter}">
                        ${filter}
                    </button>
                </span>
            `;
            filterContainer.appendChild(filterElement);
        })
    })
}