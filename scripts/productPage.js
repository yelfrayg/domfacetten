const filters = document.querySelectorAll("#checkmark");
const productContainer = document.querySelector(".products-container");
let filterobjects = [];
let allproductsArray = [];

document.addEventListener("DOMContentLoaded", async (_) => {
    const savedFilters = localStorage.getItem("productFilters");
    if (savedFilters) {
        try {
            filterobjects = JSON.parse(savedFilters) || [];
        } catch (e) {
            filterobjects = [];
        }
    }

    filters.forEach((f) => {
        const colorValue = f.getAttribute("data-value");

        if (filterobjects.includes(colorValue)) {
            f.checked = true;
        }

        f.addEventListener("click", (_) => {
            if (!filterobjects.includes(colorValue)) {
                filterobjects.push(colorValue);
            } else {
                filterobjects = filterobjects.filter((item) => item !== colorValue);
            }

            if (filterobjects.length > 0) {
                localStorage.setItem("productFilters", JSON.stringify(filterobjects));
            } else {
                localStorage.removeItem("productFilters");
            }

            showProducts(filterobjects);
        });
    });

    fetchProducts();
    testServerProducts();
});

async function fetchProducts() {
    try {
        const req = await fetch("./scripts/products/products.json");
        const res = await req.json();
        allproductsArray = res.products || [];

        // vorhandene (persistierte) Filter direkt anwenden
        if (filterobjects.length > 0) {
            showProducts(filterobjects);
        } else {
            loadAllProducts();
        }
    } catch (error) {
        console.log(error);
    }
}

function loadAllProducts() {
    productContainer.innerHTML = "";

    allproductsArray.forEach((p) => {
        const productElement = document.createElement("a");
        productElement.classList.add("product");
        productElement.href = `./product.html?id=${p.artnr}`;
        productElement.innerHTML = `
            <div class="product-img-container">
                <img src="${p.images[0]}" alt="Stoffarmband">
                <span class="product-nr">${p.artnr}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-price">${p.price},00 €</p>
            </div>
        `;

        productContainer.append(productElement);
    });
}

function showProducts(filterobjects) {
    if (filterobjects.length === 0) {
        loadAllProducts();
        return;
    }

    const filteredProducts = allproductsArray.filter((p) => {
        return filterobjects.every((f) => p.keywords.includes(f));
    });
    loadFilteredProducts(filteredProducts);
}

function loadFilteredProducts(products) {
    productContainer.innerHTML = "";

    products.forEach((p) => {
        productContainer.innerHTML += `
            <a class="product" href="./product.html?id=${p.artnr}">
                <div class="product-img-container">
                    <img src="${p.images[0]}" alt="Stoffarmband">
                    <span class="product-nr">${p.artnr}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-price">${p.price},00 €</p>
                </div>
            </a>
        `;
    });
}

async function testServerProducts() {
    try {
        const req = await fetch('http://localhost:3000/api/products')
        const res = await req.json()
        if(res.products.length == 0) {
            console.log('Leer')
            return
        }
        console.log('Produkte werden geladen!')
    } catch (error) {
        console.log(error)
    }
}