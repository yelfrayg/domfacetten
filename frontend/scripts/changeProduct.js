const container = document.querySelector(".existing-products-list");
const confirmButton = document.querySelector("#confirmDelete");
const confirmEditButton = document.getElementById("confirmEdit");

let selectedForDelete = null;
let selectedForEdit = null;

document.addEventListener("DOMContentLoaded", async (_) => {
    await loadAllProducts();
    const deleteButtons = document.querySelectorAll(".deleteBtn");
    const editButtons = document.querySelectorAll(".editBtn");

    deleteButtons.forEach((deleteButton) => {
        deleteButton.addEventListener("click", async (_) => {
            const clickedArttype = deleteButton.getAttribute("data-arttype");
            const clickedArtnr = deleteButton.getAttribute("data-artnr");

            selectedForDelete = { arttype: clickedArttype, artnr: clickedArtnr };
            confirmButton.addEventListener("click", async (_) => {
                await confirmDelete(selectedForDelete.arttype, selectedForDelete.artnr);
            })
        });
    });

    editButtons.forEach((editButton) => {
        editButton.addEventListener("click", async (_) => {
            const clickedArttype = editButton.getAttribute("data-arttype");
            const clickedArtnr = editButton.getAttribute("data-artnr");
            selectedForEdit = { arttype: clickedArttype, artnr: clickedArtnr };

            confirmEditButton.addEventListener('click', async () => {
                const nameInput = document.getElementById("editName").value;
                const descriptionInput = document.getElementById("editDescription").value;
                const priceInput = document.getElementById("editPrice").value;
                const availabilityInput = document.getElementById("editAvailability").checked;

                let data = {
                    arttype: selectedForEdit.arttype,
                    artnr: parseInt(selectedForEdit.artnr, 10),
                    name: nameInput,
                    description: descriptionInput,
                    price: parseInt(priceInput),
                    available: availabilityInput
                };

                await applyChanges(data);
            })
        })
    })
});

async function loadAllProducts() {
    try {
        if (container) container.innerHTML = "";
        const req = await fetch("http://localhost:3000/api/products");
        const res = await req.json();
        if (res) {
            let a = 1;
            res.products.forEach((p) => {
                const createListElement = document.createElement("li");
                createListElement.classList.add("list-element");
                createListElement.innerHTML = `
                    <p>${a}</p>
                    <p>${p.arttype}${p.artnr}</p>
                    <p>${p.name}</p>
                    <p class="price">${p.price},00 &euro;</p>
                    <div>
                        <button type="button" class="editBtn" data-arttype="${p.arttype}" data-artnr="${p.artnr}" popovertarget="popup-edit"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                        <button type="button" class="deleteBtn" data-arttype="${p.arttype}" data-artnr="${p.artnr}" popovertarget="popup-delete"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                    </div>
                `;
                container.append(createListElement);
                a++;
            });
        }
    } catch (error) {
        console.log(error);
    }
}

async function confirmDelete(arttype, artnr) {
    try {
        const req = await fetch(
            `http://localhost:3000/api/products/deleteProduct`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Delete-Key": "04061973",
                },
                body: JSON.stringify({
                    arttype: arttype,
                    artnr: artnr,
                }),
            },
        );
        const res = await req.json();

        if (res.message == "success") {
            alert("Produkt erfolgreich entfernt");
            window.location.reload();
        }
    } catch (error) {
        console.log(error);
    }
}

async function applyChanges(data) {
    console.log("Frage für Update an:", data);
    try {
        const req = await fetch(
            "http://localhost:3000/api/products/updateProduct",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data }),
            },
        );
        const res = await req.json();
        if (res.message == "success") {
            alert("Produkt erfolgreich aktualisiert");
            window.location.reload();
        }
    } catch (error) {
        console.log(error);
    }
}