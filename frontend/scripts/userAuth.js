document.addEventListener("DOMContentLoaded", (_) => {
    const register = document.querySelector("form.form1");
    const login = document.querySelector("form.form2");

    register.addEventListener("submit", async (event) => {
        event.preventDefault();

        const mail = document.getElementById("email-reg").value;
        const pw1 = document.getElementById("password-reg").value;
        const pw2 = document.getElementById("password-reg-repeat").value;

        try {
            if (pw1 !== pw2) {
                alert("Passwörter stimmen nicht überein.");
                return;
            }
            if (mail === "") {
                alert("E-Mail nicht eingegeben.");
                return;
            }

            let data = {
                email: mail,
                password: pw1,
            };

            console.log(data);

            const req = await fetch(
                "http://localhost:3000/api/userManagement/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );

            const res = await req.json();
            console.log(res);
            if (!res.userId) {
                alert(
                    "Registrierung nicht erfolgreich: " +
                        (res.message || "Unbekannter Fehler"),
                );
                return;
            }
            console.log("Registrierung erfolgreich! Bitte melden Sie sich an.");
            register.reset();
            window.location = "/dashboard.html?userId=" + res.userId;
        } catch (error) {
            console.error("Registrierungsfehler:", error);
            alert("Registrierungsfehler: " + error.message);
        }
    });

    login.addEventListener("submit", async (event) => {
        event.preventDefault();

        const mail = document.getElementById("email-login").value;
        const password = document.getElementById("password-login").value;

        try {
            if (mail === "" || password === "") {
                alert("Bitte Eingaben vervollständigen!");
                return;
            }

            let data = {
                email: mail,
                password: password,
            };

            console.log("Login: ", data);

            const req = await fetch(
                "http://localhost:3000/api/userManagement/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );

            const res = await req.json();
            console.log(res)
            if (res.userId) {
                window.location = `/dashboard.html?userId=${res.userId}`;
                return
            }
            alert('Login nicht erfolgreich, weil falsche Credentials!')

        } catch (error) {
            console.error("Login Fehler:", error);
            alert("Login Fehler: " + error.message);
        }
    });
});

async function login(data) {
    try {
        const req = await fetch('http://localhost:3000/api/userManagement/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        const res = await req.json()
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}