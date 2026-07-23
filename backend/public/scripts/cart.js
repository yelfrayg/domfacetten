const deliverName = document.querySelector('.delivery-name')
const deliverStreet = document.querySelector('.delivery-street')
const deliverCity = document.querySelector('.delivery-city')
const cartItemsContainer = document.querySelector('#cart-items')
const totalPrice = document.getElementById('total-price')
const paypalContainer = document.getElementById('paypal')
const itemCounter = document.querySelector('.product-count')
const itemCounterPrice = document.querySelector('.product-price')
const discountCodeInput = document.getElementById('code-input')
const iconCheck = document.querySelector('.code-verification-wrapper')
const pencil = document.querySelector('.pencil-wrapper')

pencil.addEventListener('click', _ => {
    window.location = `/dashboard.html?userId=${localStorage.getItem('userId')}`
})

const icons = {
    valid: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#75FB4C"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>',
    waiting: '<span class="loaderCode"></span>',
    invalid: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff0000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>'
}

let price = 0
let originalPrice = 0


document.addEventListener('DOMContentLoaded', async _ => {
    try {
        const userId = localStorage.getItem('userId')
        const reqCartItems = await fetch(`/api/cartManagement/getCartItems/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("userToken") || ''
            }
        })
        const resCartItems = await reqCartItems.json()
        if (reqCartItems.status == 401) {
            // alert('Access denied!')
            // window.location = "/productPage"
            return
        }

        if (resCartItems.cartItems.length == 0) {
            cartItemsContainer.innerHTML = '<h2>Dein Warenkorb ist leer!</h2>'
            paypalContainer.style.display = 'none'
        }

        // totalPrice.textContent = String(price).replace('.', ',') + '0 €'

        resCartItems.cartItems.forEach(element => {
            const cartEntry = document.createElement('tr')
            cartEntry.classList.add('single-cart-item')
            cartEntry.innerHTML = `
                <td class="image-container">
                    <img src="/uploads/products/${element.product.heroImage}" alt="Image" />
                </td>
                <td class="art-info-text">
                    <div class="product-info">
                        <span class="artname">${element.product.name}</span>
                        <span class="quantity">Menge: ${element.quantity}</span>
                        <span class="item-price">${parseFloat(element.product.price).toFixed(2).replace('.', ',')} €</span>
                    </div>
                    <button class="delete-btn" data-artnr="${element.product.artnr}">X</button>
                </td>
            `
            cartItemsContainer.appendChild(cartEntry)
            price += element.product.price * element.quantity
            totalPrice.textContent = price.toFixed(2).replace('.', ',') + ' €'
        });

        originalPrice = price
        // console.log(originalPrice)

        await deleteFromCart()

        //??????????????????????????????????????????????????        

        const reqUser = await fetch(`/api/userManagement/getUserInfo/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("userToken") || ''
            }
        })
        const resUser = await reqUser.json()
        // console.log(resUser.userInfo)

        if (
            resUser.userInfo.first_name == '' ||
            resUser.userInfo.last_name == '' ||
            resUser.userInfo.address.street == '' ||
            resUser.userInfo.address.city == ''
        ) {
            paypalContainer.style.display = 'none'
            cartItemsContainer.innerHTML = '<h2>Bitte hinterlege zuerst deine Lieferadresse im Dashboard, um fortzufahren!</h2>'
            totalPrice.innerHTML = '-,-- €'
            deliverName.textContent = resUser.userInfo.first_name + ' ' + resUser.userInfo.last_name
            deliverStreet.textContent = resUser.userInfo.address.street === '' ? '---' : resUser.userInfo.address.street
            deliverCity.textContent = resUser.userInfo.address.city === '' ? '---' : resUser.userInfo.address.city
            itemCounter.textContent = resCartItems.cartItems.length === 1 ? '1 Produkt' : resCartItems.cartItems.length + ' Produkte'
            return
        }

        deliverName.textContent = resUser.userInfo.first_name + ' ' + resUser.userInfo.last_name
        deliverStreet.textContent = resUser.userInfo.address.street === '' ? '---' : resUser.userInfo.address.street
        deliverCity.textContent = resUser.userInfo.address.city === '' ? '---' : resUser.userInfo.address.city
        itemCounter.textContent = resCartItems.cartItems.length === 1 ? '1 Produkt' : resCartItems.cartItems.length + ' Produkte'
        itemCounterPrice.textContent = price.toFixed(2).replace('.', ',') + ' €'

        await ppCart()

        const debouncedCodeChecker = debounce(codeChecker, 1000)
        discountCodeInput.addEventListener('input', _ => {
            const code = discountCodeInput.value.toUpperCase()
            if (code) {
                if (iconCheck) iconCheck.innerHTML = icons.waiting
                debouncedCodeChecker()
            } else {
                if (iconCheck) iconCheck.innerHTML = ''
            }
        })

    } catch (error) {
        console.log(error)
    }
})

async function ppCart() {
    paypal
        .Buttons({
            createOrder: () => {
                // Code erst hier auslesen, wenn Button geklickt wird
                const codeInput = document.getElementById('code-input')
                const code = codeInput ? codeInput.value.toUpperCase() : ''
                return fetch(
                    "/api/purchases/createCartPurchase",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": localStorage.getItem("userToken") || ''
                        },
                        body: JSON.stringify({
                            data: {
                                userId: localStorage.getItem('userId'),
                                code: code
                            },
                        }),
                    },
                )
                    .then(function (res) {
                        if (!res.ok) {
                            return res
                                .json()
                                .then((json) => Promise.reject(json));
                        }
                        console.log("Bestellung erfolgreich erstellt:", res);
                        return res.json();
                    })
                    .then(({ id }) => {
                        return id;
                    })
                    .catch((error) => {
                        console.error(
                            "Fehler beim Erstellen der Bestellung:",
                            error,
                        );
                        alert(
                            "Hmm. Anscheinend ist der Server gerade am Schlafen. Bitte versuchen Sie es später erneut :)",
                        );
                    });
            },
            onApprove: function (data, actions) {
                const codeInput = document.getElementById('code-input')
                const code = codeInput ? codeInput.value.toUpperCase() : ''
                return actions.order.capture().then(async function (details) {
                    const completeOrder = await fetch('/api/purchases/completeCartPurchase', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("userToken") || ''
                        },
                        body: JSON.stringify({
                            userId: localStorage.getItem('userId'),
                            paypalOrderId: data.orderID,
                            code: code
                        })
                    })
                    const resOrder = await completeOrder.json()
                    console.log(resOrder)
                });
            },
        })
        .render("#paypal");
}

async function deleteFromCart() {
    const deleteButtons = document.querySelectorAll('.delete-btn')
    deleteButtons.forEach(b => {
        b.addEventListener('click', async _ => {
            const artnr = b.getAttribute('data-artnr')

            try {
                let data = {
                    userId: localStorage.getItem('userId'),
                    productId: parseInt(artnr)
                }

                const req = await fetch('/api/cartManagement/removeItem', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('userToken') || ''
                    },
                    body: JSON.stringify(data)
                })
                const res = await req.json()
                if (req.ok) {
                    location.reload()
                    return
                }
                alert('Etwas ist schiefgelaufen!')
            }
            catch (error) {
                console.warn(error)
            }
        })
    })
}

async function codeChecker() {
    try {
        // console.log('Code Checker aufgerufen!')
        const code = discountCodeInput.value.toUpperCase()

        if (code === '') {
            // Wenn Code leer ist, Originalpreis wiederherstellen
            if (iconCheck) iconCheck.innerHTML = ``
            price = originalPrice
            totalPrice.textContent = price.toFixed(2).replace('.', ',') + ' €'
            itemCounterPrice.textContent = price.toFixed(2).replace('.', ',') + " €"
            return
        }

        if (iconCheck) iconCheck.innerHTML = icons.waiting

        const req = await fetch(`/api/discountManagement/getDiscount/${code}`)
        const res = await req.json()
        // console.log(res)
        if (res.code == 200) {
            if (iconCheck) iconCheck.innerHTML = icons.valid
            const discount = res.discountObj.codeValue
            const discountedPrice = parseFloat(originalPrice * (1 - discount))
            // console.log(`Code gültig! Du erhältst ${discount}% Rabatt auf deine Bestellung!`)
            price = discountedPrice
            totalPrice.textContent = discountedPrice.toFixed(2).replace('.', ',') + ' €'
            return
        }
        console.log('Code ungültig!')
        if (iconCheck) iconCheck.innerHTML = icons.invalid
        price = originalPrice
        totalPrice.textContent = price.toFixed(2).replace('.', ',') + ' €'
        itemCounterPrice.textContent = price.toFixed(2).replace('.', ',') + " €"
        return
    } catch (error) {
        console.log(error)
    }
}

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => func(...args), delay)
    }
}