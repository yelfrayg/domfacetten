const deliverName = document.querySelector('.delivery-name')
const deliverStreet = document.querySelector('.delivery-street')
const deliverCity = document.querySelector('.delivery-city')
const cartItemsContainer = document.getElementById('cart-items')
const totalPrice = document.getElementById('total-price')
const paypalContainer = document.getElementById('paypal')
const itemCounter = document.querySelector('.product-count')
const itemCounterPrice = document.querySelector('.product-price')
const discountCodeInput = document.getElementById('code-input')
const iconCheck = document.querySelector('.code-verification-wrapper')
const pencil = document.querySelector('.pencil-wrapper')

let codeValue = 0
let products = []
let isApplied = false

function formatMoney(value) {
    const amount = Number(value) || 0
    return `${amount.toFixed(2).replace('.', ',')} €`
}

function parseMoney(value) {
    if (!value) return 0
    const normalized = String(value)
        .replace(/[^0-9,.-]/g, '')
        .replace('.', '')
        .replace(',', '.')
    return Number(normalized) || 0
}

pencil.addEventListener('click', _ => {
    window.location = `/dashboard/${localStorage.getItem('userId')}`
})

const icons = {
    valid: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#75FB4C"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>',
    waiting: '<span class="loaderCode"></span>',
    invalid: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff0000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>'
}


document.addEventListener('DOMContentLoaded', async _ => {
    try {
        const userId = localStorage.getItem('userId')
        await loadCartItems(userId)
        await calculateTotalPrice()

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
        // console.log(resUser)
        console.log('----------------')
        const userObject = resUser.data.reqData

        if (
            userObject.first_name == '' ||
            userObject.last_name == '' ||
            userObject.address.street == '' ||
            userObject.address.city == ''
        ) {
            paypalContainer.style.display = 'none'
            cartItemsContainer.innerHTML = '<h2>Bitte hinterlege zuerst deine Lieferadresse im Dashboard, um fortzufahren!</h2>'
            totalPrice.innerHTML = '-,-- €'
            deliverName.textContent = userObject.first_name + ' ' + userObject.last_name
            deliverStreet.textContent = userObject.address.street === '' ? '---' : userObject.address.street
            deliverCity.textContent = userObject.address.city === '' ? '---' : userObject.address.city
            itemCounter.textContent = resCartItems.cartItems.length === 1 ? '1 Produkt' : resCartItems.cartItems.length + ' Produkte'
            return
        }

        deliverName.textContent = userObject.first_name + ' ' + userObject.last_name
        deliverStreet.textContent = userObject.address.street === '' ? '---' : userObject.address.street
        deliverCity.textContent = userObject.address.city === '' ? '---' : userObject.address.city

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

async function loadCartItems(userId) {
    try {
        const reqCartItems = await fetch(`/api/cartManagement/getCartItems/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("userToken") || ''
            }
        })
        const resCartItems = await reqCartItems.json()
        products = Array.isArray(resCartItems?.data?.reqData) ? resCartItems.data.reqData : []

        if (resCartItems.status == 'FAILURE') {
            alert('Access denied!')
            window.location = "/products"
            return
        }

        cartItemsContainer.innerHTML = ''

        if (products.length === 0) {
            console.log('Cart is empty!')
            const cartItem = document.createElement('tr')
            cartItemsContainer.innerHTML = `
                <td colspan="4" class="empty-cart-container">
                    <div class="empty-cart-icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" fill=#000000><path d="M223.5-103.5Q200-127 200-160t23.5-56.5Q247-240 280-240t56.5 23.5Q360-193 360-160t-23.5 56.5Q313-80 280-80t-56.5-23.5Zm400 0Q600-127 600-160t23.5-56.5Q647-240 680-240t56.5 23.5Q760-193 760-160t-23.5 56.5Q713-80 680-80t-56.5-23.5ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>
                    </div>
                    <p class="empty-cart-text">Dein Warenkorb ist leer!</p>
                </td>
            `
            paypalContainer.style.display = 'none'
            itemCounter.textContent = '0 Produkte'
            itemCounterPrice.textContent = '0,00 €'
            totalPrice.textContent = '0,00 €'
            return resCartItems
        }

        paypalContainer.style.display = 'block'

        products
            .sort((a, b) => a.productId - b.productId)
            .forEach(element => {
                const cartEntry = document.createElement('tr')
                cartEntry.classList.add('single-cart-item')
                cartEntry.innerHTML = `
                    <td class="image-container">
                        <img src="/uploads/products/${element.product.heroImage}" alt="Image" />
                    </td>
                    <td class="art-info-text">
                        <div class="product-info">
                            <span class="artname"><a href="/product/${element.product.artnr}">${element.product.name}</a></span>
                            <span class="quantity">Menge: <button class="quantity-btn" data-artnr="${element.product.artnr}" data-action="decrease">-</button><span class="item-quantity" data-max-amount="${element.product.inStock}">${element.quantity}</span><button class="quantity-btn" data-artnr="${element.product.artnr}" data-action="increase">+</button></span>
                            <span class="item-price">${parseFloat(element.product.price).toFixed(2).replace('.', ',')} €</span>
                        </div>
                        <button class="delete-btn" data-artnr="${element.product.artnr}">X</button>
                    </td>
                `
                cartItemsContainer.appendChild(cartEntry)
            });

        const quantityButtons = document.querySelectorAll('.quantity-btn')
        quantityButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const buttonElement = event.currentTarget
                const row = buttonElement.closest('.single-cart-item')
                const quantityElement = row?.querySelector('.item-quantity')
                const productId = buttonElement.dataset.artnr
                const action = buttonElement.dataset.action

                await updateAmount(productId, action, quantityElement)
                await loadCartItems(localStorage.getItem('userId'))
                await calculateTotalPrice()
            })
        })

        return resCartItems
    }
    catch (error) {
        console.log(error)
    }
}

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
                    if (resOrder) {
                        cartItemsContainer.innerHTML =
                            `
                            <div class="success-message">
                                <h2>Vielen Dank für Ihren Einkauf!</h2>
                                <p>Ihre Bestellung wurde erfolgreich abgeschlossen.</p>
                                <p>Sie können die Bestellung in ihrem Dashboard einsehen.</p>
                                <p>Sie erhalten in Kürze eine Bestätigung per E-Mail.</p>
                            </div>
                        `
                        totalPrice.innerHTML = '-,-- €'
                        itemCounter.textContent = '0 Produkte'
                        itemCounterPrice.textContent = '-,-- €'
                    }
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

//! BUG
async function codeChecker() {
    try {
        const code = discountCodeInput.value.toUpperCase()
        const originalPrice = parseMoney(totalPrice.textContent)

        if (code === '' || isApplied == true) {
            if (iconCheck) iconCheck.innerHTML = ``
            await loadCartItems(localStorage.getItem('userId'))
            await calculateTotalPrice()
            return
        }

        if (iconCheck) iconCheck.innerHTML = icons.waiting

        const req = await fetch(`/api/discountManagement/getDiscount/${code}`)
        const res = await req.json()
        if (res.code == 200) {
            isApplied = true
            if (iconCheck) iconCheck.innerHTML = icons.valid
            const discount = Number(res.discountObj.codeValue) || 0
            const discountedPrice = originalPrice * (1 - discount)
            totalPrice.textContent = formatMoney(discountedPrice)
            itemCounterPrice.textContent = formatMoney(discountedPrice)
            return
        }

        console.log('Code ungültig!')
        if (iconCheck) iconCheck.innerHTML = icons.invalid
        totalPrice.textContent = formatMoney(originalPrice)
        itemCounterPrice.textContent = formatMoney(originalPrice)
        return
    } catch (error) {
        console.log(error)
    }
}

async function updateAmount(id, action, quantityElement) {
    if (!quantityElement) {
        return
    }

    const currentAmount = parseInt(quantityElement.textContent, 10)
    if (currentAmount <= 1 && action === 'decrease') {
        return
    }
    if (currentAmount >= parseInt(quantityElement.dataset.maxAmount, 10) && action === 'increase') {
        quantityElement.textContent = parseInt(quantityElement.dataset.maxAmount, 10)
        return
    }

    const nextAmount = action === 'increase' ? currentAmount + 1 : currentAmount - 1
    quantityElement.textContent = nextAmount
    console.log('New Amount: ', nextAmount)

    try {
        const data = {
            userId: localStorage.getItem('userId'),
            productId: parseInt(id, 10),
            quantity: parseInt(nextAmount, 10)
        }

        console.log('Updating cart item with data:', data)

        const req = await fetch(`/api/cartManagement/updateAmount`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('userToken') || ''
            },
            body: JSON.stringify(data)
        })
        const res = await req.json()
        if (res.code === 200) {
            console.log(res.message)
        }
    }
    catch (error) {
        console.log(error)
    }
}

async function calculateTotalPrice() {
    if (!products || products.length === 0) {
        const cartProducts = await loadCartItems(localStorage.getItem('userId'))
        products = Array.isArray(cartProducts?.data?.reqData) ? cartProducts.data.reqData : []
    }

    const total = products.reduce((sum, product) => {
        const productPrice = Number(product?.product?.price) || 0
        const quantity = Number(product?.quantity) || 0
        return sum + productPrice * quantity
    }, 0)

    const totalItems = products.reduce((sum, product) => {
        const quantity = Number(product?.quantity) || 0
        return sum + quantity
    }, 0)

    itemCounter.textContent = totalItems === 1 ? '1 Produkt' : totalItems + ' Produkte'
    itemCounterPrice.textContent = formatMoney(total)
    totalPrice.textContent = formatMoney(total)
    return total
}

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => func(...args), delay)
    }
}