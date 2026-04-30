document.addEventListener("DOMContentLoaded", async (_) => {
    await redirect()
    const register = document.querySelector("form.form1");
    const login = document.querySelector("form.form2");
    const turnSymbol = document.querySelector(".turn");

    register.addEventListener("submit", async (event) => {
        event.preventDefault();

        const mail = document.getElementById("email-reg").value;
        const pw1 = document.getElementById("password-reg").value;
        const pw2 = document.getElementById("password-reg-repeat").value;
        const loader = register.querySelector(".loader");

        try {
            if (pw1 !== pw2) {
                alert("Passwörter stimmen nicht überein.");
                return;
            }
            if (mail === "") {
                alert("E-Mail nicht eingegeben.");
                return;
            }

            // Loader anzeigen, nachdem Validierung erfolgreich war
            loader.classList.remove("invisible");

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
                loader.classList.add("invisible");
                return;
            }
            console.log("Registrierung erfolgreich! Bitte melden Sie sich an.");
            register.reset();
            localStorage.setItem("userId", res.userId);
        } catch (error) {
            console.error("Registrierungsfehler:", error);
            alert("Registrierungsfehler: " + error.message);
            loader.classList.add("invisible");
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
            console.log(res);
            if (res.userId) {
                localStorage.setItem("userId", res.userId);
                localStorage.setItem("userToken", res.userToken)
                window.location = `/dashboard.html?userId=${res.userId}`;
                return;
            }
            alert("Login nicht erfolgreich, weil falsche Credentials!");
        } catch (error) {
            console.error("Login Fehler:", error);
            alert("Login Fehler: " + error.message);
        }
    });
});

async function login(data) {
    try {
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
        console.log(res);
    } catch (error) {
        console.log(error);
    }
}

async function redirect() {
    try {
        const userId = localStorage.getItem("userId")
        const token = localStorage.getItem("userToken")
        
        if(userId && token && userId.length !== 0 && token.length !== 0) {
            // Token prüfen - wenn NICHT abgelaufen, zum Dashboard
            if (!isTokenExpired(token)) {
                window.location = `/dashboard.html?userId=${userId}`
            } else {
                // Token abgelaufen - localStorage clearen
                localStorage.removeItem("userToken")
                localStorage.removeItem("userId")
            }
        }
    } catch (error) {
        console.log(error)
    }
}

// Token dekodieren und Ablauf prüfen
function isTokenExpired(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        const decoded = JSON.parse(jsonPayload);
        const expirationTime = decoded.exp * 1000; // in Millisekunden
        
        return Date.now() >= expirationTime;
    } catch (error) {
        console.error('Fehler beim Dekodieren des Tokens:', error);
        return true; // Im Fehlerfall als abgelaufen behandeln
    }
}