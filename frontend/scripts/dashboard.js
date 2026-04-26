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
const deleteBtn = document.getElementById("deleteAccount")

document.addEventListener("DOMContentLoaded", async (_) => {
    const userData = await getUserInfo(userId);
    console.log(userData);

    if (userData) {
        firstNameInput.value = userData.first_name || "";
        lastNameInput.value = userData.last_name || "";
        emailInput.value = userData.email || "";
        passwordInput.value = userData.password;

        if (userData.address) {
            streetInput.value = userData.address.street || "";
            cityInput.value = userData.address.city || "";
        }
    }

    updateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await updateUserInfo();
    });

    deleteBtn.addEventListener('click', async _ => {
        await deleteUser(userId)
    })
});

async function getUserInfo(userId) {
    try {
        const req = await fetch(
            `http://localhost:3000/api/userManagement/getUserInfo/${userId}`,
        );
        const res = await req.json();
        return res.userInfo;
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
        console.log(`Sende ${updatedData} an Server!`);
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
        console.log(res);
    } catch (error) {
        console.log(error);
    }
}

async function deleteUser(userId) {
    try {
        const req = await fetch(`http://localhost:3000/api/userManagement/deleteUser/${userId}`, { method: 'DELETE' })
        const res = await req.json()
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}