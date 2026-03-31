const container = document.querySelector(".existing-products-list");
const deleteButton = document.getElementById("deleteBtn");
console.log(deleteButton);

document.addEventListener("DOMContentLoaded", (_) => {
    loadAllProducts();

    deleteButton.addEventListener("click", async (_) => {
        const clickedArttype = deleteButton.getAttribute("data-arttype");
        const clickedArtnr = deleteButton.getAttribute("data-artnr");
        try {
            const req = await fetch(
                `http://localhost:3000/api/products/delete/`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: {
                        arttype: clickedArttype,
                        artnr: clickedArtnr,
                    },
                },
            );
            const res = await req.json();
            if (res.ok) {
                alert("Produkt erfolgreich entfernt");
            }
        } catch (error) {
            return error;
        }
    });
});

async function loadAllProducts() {
    try {
        const req = await fetch("http://localhost:3000/api/products");
        const res = await req.json();
        if (res) {
            let a = 1
            res.products.forEach((p) => {
                
                const createListElement = document.createElement("li");
                createListElement.classList.add("list-element");
                createListElement.innerHTML = `
                    <p>${a}</p>
                    <p>${p.arttype}${p.artnr}</p>
                    <p class="price">${p.price} &euro;</p>
                    <div>
                        <button type="button">C</button>
                        <button type="button" id="deleteBtn" data-arttype="${p.arttype}" data-artnr="${p.artnr}">D</button>
                    </div>
                `;
                container.append(createListElement);
                a++
            });
        }
    } catch (error) {
        console.log(error);
    }
}
