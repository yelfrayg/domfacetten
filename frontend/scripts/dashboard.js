const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);
const userId = searchParams.get("userId");

// Selektiere alle Formularfelder unter "Meine Angaben"
let firstNameInput = document.getElementById("first-name");
let lastNameInput = document.getElementById("last-name");
let emailInput = document.getElementById("email");
let streetInput = document.getElementById("straße-nr");
let cityInput = document.getElementById("stadt-plz");
let passwordInput = document.getElementById("new-password");
let updateForm = document.getElementById("updateUser");
const deleteBtn = document.getElementById("deleteAccount");

// Selektiere Bestelllistetabelle
const ordersTableBody = document.querySelector(".user-orders");

document.addEventListener("DOMContentLoaded", async (_) => {
    const showPasswordBtn = document.getElementById("show-password");

    showPasswordBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            showPasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-160h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM240-160v-400 400Zm0 80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h280v-80q0-83 58.5-141.5T720-920q83 0 141.5 58.5T920-720h-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80h120q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Z"/></svg>`;
        } else {
            passwordInput.type = "password";
            showPasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>`;
        }
    });

    if (!userId) {
        alert("UserID nicht gefunden. Bitte neu anmelden.");
        window.location = "/userAuth.html";
        return;
    }

    const userData = await getUserInfo(userId);
    console.log("Geladene Userdaten:", userData);
    const userOrders = await getOrders(userId);

    if (userData && userData.code === 200) {
        const userInfo = userData.userInfo;
        firstNameInput.value = userInfo.first_name || "";
        lastNameInput.value = userInfo.last_name || "";
        emailInput.value = userInfo.email || "";
        passwordInput.value = userInfo.password || "";

        if (userInfo.address) {
            streetInput.value = userInfo.address.street || "";
            cityInput.value = userInfo.address.city || "";
        }
        localStorage.setItem("user-letter", userInfo.first_name)

    } else {
        console.error("Fehler beim Laden der Userdaten:", userData);
        alert("Daten konnten nicht geladen werden.");
    }

    updateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await updateUserInfo();
    });

    deleteBtn.addEventListener("click", async (_) => {
        await deleteUser(userId);
        localStorage.removeItem("userId");
        window.location = "/userAuth.html"
    });
});

async function getUserInfo(userId) {
    try {
        const req = await fetch(
            `http://localhost:3000/api/userManagement/getUserInfo/${userId}`, {
            method: 'GET',
            headers: {
                "Authorization": localStorage.getItem("userToken") || ""
            }
        }
        );
        const res = await req.json();
        return res;
    } catch (error) {
        console.log(error);
    }
}

async function updateUserInfo() {
    try {
        const updatedData = {
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            address: {
                street: streetInput.value,
                city: cityInput.value,
            },
        };

        const req = await fetch(
            `http://localhost:3000/api/userManagement/updateUserInfo/${userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            },
        );
        const res = await req.json();
        if (req.status === 200) {
            console.log(res);
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteUser(userId) {
    try {
        const req = await fetch(
            `http://localhost:3000/api/userManagement/deleteUser/${userId}`,
            { method: "DELETE" },
        );
        const res = await req.json();
        console.log(res);
    } catch (error) {
        console.log(error);
    }
}

async function getOrders(userId) {
    try {
        const req = await fetch(
            `http://localhost:3000/api/userManagement/getOrders/${userId}`,
        );
        const res = await req.json();
        console.log(res);
        if (res.orders.length == 0) {
            console.log("Keine Bestellungen gefunden");
            ordersTableBody.innerHTML = "<p>Keine Bestellungen gefunden</p>";
            return;
        }

        console.log("Bestellungen gefunden: ", res.orders);

        res.orders.forEach((order) => {
            const listItem = document.createElement("li");
            listItem.classList.add("user-order");
            listItem.innerHTML = `
                            <details>
                                <summary>${new Date(order.timestamp).toLocaleDateString()}</summary>
                                <strong>Bestellnummer: ${order.orderId}</strong>
                                ${order.products.map((p) => `<p>${p.name}</p>`).join("")}
                                <p>Preis: ${order.products.map((p) => p.price * p.quantity)}€</p>
                            </details>
            `;
            ordersTableBody.appendChild(listItem);
        });
    } catch (error) {
        console.log(error);
    }
}
