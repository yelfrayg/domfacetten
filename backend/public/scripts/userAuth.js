const errorMessageLogin = document.getElementById('error-message-login')
const errorMessageRegister = document.getElementById('error-message-register')
const msgFromUrl = new URLSearchParams(window.location.search).get('msg')
const hasAccount = document.querySelectorAll("#show-login-form");
const noAccount = document.getElementById("show-register-form");
const pwResetForm = document.getElementById("show-password-reset-form");
const reqOTPBtn = document.getElementById("reset-otp");
const sendOTPBtn = document.getElementById("send-otp");
const updatePasswordBtn = document.getElementById("update-password");
const errorMessagePwReset = document.getElementById('error-message-pw-reset')

if(msgFromUrl === '401') {
    errorMessage("Bitte logge dich ein, um auf deine Daten zuzugreifen.", 'login')
}

if (msgFromUrl === '403') {
    errorMessage("Bitte logge dich ein, um Artikel in den Warenkorb zu legen.", 'login')
}

if (msgFromUrl === '500') {
    errorMessage("Server ist offline oder nicht erreichbar.", 'login')
    localStorage.removeItem("userToken")
    localStorage.removeItem("userId")
}

function errorMessage(message, type) {
    if (type == 'login') {
        errorMessageLogin.textContent = message
        errorMessageLogin.style.display = 'flex'
        errorMessageRegister.style.display = 'none'
    }
    if (type == 'register') {
        errorMessageRegister.textContent = message
        errorMessageRegister.style.display = 'flex'
        errorMessageLogin.style.display = 'none'
    }
    if (type == 'pw-reset') {
        errorMessagePwReset.textContent = message
        errorMessagePwReset.style.display = 'flex'
        errorMessageLogin.style.display = 'none'
        errorMessageRegister.style.display = 'none'
    }
}

document.addEventListener("DOMContentLoaded", async (_) => {
    await redirect()
    let mail = '';
    const register = document.querySelector("form.form1");
    const login = document.querySelector("form.form2");

    noAccount.addEventListener("click", event => {
        event.preventDefault();
        toggleForms('register');
    });

    hasAccount.forEach((element) => {
        element.addEventListener("click", event => {
            event.preventDefault();
            toggleForms('login');
        });
    });

    pwResetForm.addEventListener("click", event => {
        event.preventDefault();
        toggleForms('password-reset');
    });

    reqOTPBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email-reset").value;
        mail = email;
        console.log('Request for: ' + mail)
        try {
            const req = await fetch("/api/userManagement/request-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            },
            );
            const res = await req.json();
            if (res.message.code === 200) {
                toggleForms('otp');
            }
            console.log(res);
        } catch (error) {
            console.log(error)
        }
    });

    sendOTPBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        const otp = document.getElementById("otp-input").value;
        try {
            console.log(mail, otp)
            const req = await fetch("/api/userManagement/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mail, otp }),
            },
            );
            const res = await req.json();
            console.log(res)
            if (res.message.code === 200) {
                console.log("OTP verified successfully.");
                // Weiterleitung oder andere Aktionen nach erfolgreicher OTP-Überprüfung
                const user_mail_span = document.querySelector(".user-mail");
                user_mail_span.textContent = mail; // Setze die E-Mail-Adresse im span-Element
                toggleForms('new-password');
                return;
            }
            console.log(res);
            if(res.message.code === 400) {
                alert("Ungültiger OTP-Code. Bitte überprüfen Sie Ihre Eingabe.");
            }
            
        } catch (error) {
            console.log(error)
        }
    });

    updatePasswordBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        const newPassword = document.getElementById("pw-reset-one").value;
        const confirmPassword = document.getElementById("pw-reset-two").value;

        try {
            if (newPassword !== confirmPassword) {
                errorMessage("Passwörter stimmen nicht überein.", 'pw-reset');
                return;
            }
            console.log('Passwörter stimmen überein. Sende Anfrage zum Aktualisieren des Passworts...');
            console.log(mail, newPassword)
            const req = await fetch("/api/userManagement/update-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mail, newPassword }),
            })
            const res = await req.json();
            console.log(res)
            if (res.message.code === 200) {
                console.log("Passwort erfolgreich aktualisiert. Als nächstes toggleForms('login')");
                errorMessage("Passwort erfolgreich aktualisiert. Bitte loggen Sie sich ein.", 'login'); 
                toggleForms('login');
            }
        } catch (error) {
            console.log(error)
        }
    })




    register.addEventListener("submit", async (event) => {
        event.preventDefault();

        const mail = document.getElementById("email-reg").value;
        const pw1 = document.getElementById("password-reg").value;
        const pw2 = document.getElementById("password-reg-repeat").value;
        const loader = register.querySelector(".loader");

        try {
            if (pw1 !== pw2) {
                errorMessage("Passwörter stimmen nicht überein.", 'register');
                return;
            }
            if (mail === "") {
                errorMessage("E-Mail nicht eingegeben.", 'register');
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
                "/api/userManagement/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );

            const res = await req.json();
            if (res.code == 2002) {
                errorMessage("E-Mail bereits vergeben.", 'register');
                loader.classList.add("invisible");
                return
            }

            if (!res.userId) {
                errorMessage("Unbekannter Serverfehler", 'register');
                loader.classList.add("invisible");
                return;
            }
            console.log("Registrierung erfolgreich! Bitte melden Sie sich an.");
            register.reset();
            localStorage.setItem("userId", res.userId);
        } catch (error) {
            errorMessage("Serverfehler.", 'register');
            loader.classList.add("invisible");
        }
    });

    login.addEventListener("submit", async (event) => {
        event.preventDefault();

        const mail = document.getElementById("email-login").value;
        const password = document.getElementById("password-login").value;

        try {
            if (mail === "" || password === "") {
                errorMessage("Bitte Eingaben vervollständigen!", 'login');
                return;
            }

            let data = {
                email: mail,
                password: password,
            };

            console.log("Login: ", data);

            const req = await fetch(
                "/api/userManagement/login",
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
            errorMessage("Falsche E-Mail/Passwort Kombination.", 'login');
        } catch (error) {
            console.error("Login Fehler:", error);
            errorMessage("Serverfehler", 'login');
        }
    });
});

async function login(data) {
    try {
        const req = await fetch(
            "/api/userManagement/login",
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

        // Vom Backend prüfen, ob Nutzer existiert

        if (userId && token && userId.length !== 0 && token.length !== 0) {
            // Token prüfen - wenn NICHT abgelaufen, zum Dashboard
            console.log(isTokenExpired(token))
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

function toggleForms(formId) {
    const registerForm = document.querySelector('.register-form-container');
    const loginForm = document.querySelector('.login-form-container');
    const pwResetForm = document.querySelector('.password-reset-container');
    const otpForm = document.querySelector('.otp-form-container');
    const newPasswordForm = document.querySelector('.new-password-container');

    if (formId === 'register') {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        pwResetForm.style.display = 'none';
        otpForm.style.display = 'none';
        newPasswordForm.style.display = 'none';
    } else if (formId === 'login') {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        pwResetForm.style.display = 'none';
        otpForm.style.display = 'none';
        newPasswordForm.style.display = 'none';
    } else if (formId === 'password-reset') {
        registerForm.style.display = 'none';
        loginForm.style.display = 'none';
        pwResetForm.style.display = 'block';
        otpForm.style.display = 'none';
        newPasswordForm.style.display = 'none';
    } else if (formId === 'otp') {
        registerForm.style.display = 'none';
        loginForm.style.display = 'none';
        pwResetForm.style.display = 'none';
        otpForm.style.display = 'block';
        newPasswordForm.style.display = 'none';
    }
    else if (formId === 'new-password') {
        registerForm.style.display = 'none';
        loginForm.style.display = 'none';
        pwResetForm.style.display = 'none';
        otpForm.style.display = 'none';
        newPasswordForm.style.display = 'block';
    }
}

