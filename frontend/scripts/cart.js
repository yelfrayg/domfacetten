const deliverName = document.querySelector('.delivery-name')
const deliverStreet = document.querySelector('.delivery-street')
const deliverCity = document.querySelector('.delivery-city')
const cartItemsContainer = document.querySelector('#cart-items')
const totalPrice = document.getElementById('total-price')
const paypalContainer = document.getElementById('paypal')
const itemCounter = document.querySelector('.product-count')
const itemCounterPrice = document.querySelector('.product-price')

document.addEventListener('DOMContentLoaded', async _ => {
    try {
        const userId = localStorage.getItem('userId')
        const reqCartItems = await fetch(`http://localhost:3000/api/cartManagement/getCartItems/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("userToken") || ''
            }
        })
        const resCartItems = await reqCartItems.json()
        if (reqCartItems.status == 401) {
            // alert('Access denied!')
            // window.location = "/productPage.html"
            return
        }
        console.log(resCartItems.cartItems)
        if (resCartItems.cartItems.length == 0) {
            cartItemsContainer.innerHTML = ''
            paypalContainer.style.display = 'none'
        }

        let price = 0
        totalPrice.textContent = price + ',00 €'
        resCartItems.cartItems.forEach(element => {

            const cartEntry = document.createElement('tr')
            cartEntry.classList.add('single-cart-item')
            cartEntry.innerHTML = `
                <td class="image-container">
                    <img src="http://localhost:3000/uploads/products/${element.product.heroImage}" alt="Image" />
                </td>
                <td class="art-info-text">
                    <span class="artnr">${element.product.arttype || 'A'}${String(element.product.artnr).padStart(3, '0')}</span>
                    <span class="artname">${element.product.name}</span>
                </td>
                <td class="quantity">Menge: ${element.quantity}</td>
                <td class="item-price">${element.product.price},00 €</td>
                <td><button class="delete-btn" data-artnr="${element.product.artnr}">X</button></td>
            `
            cartItemsContainer.appendChild(cartEntry)
            price += parseInt(element.product.price) * element.quantity
            totalPrice.textContent = price + ',00 €'
        });

        await deleteFromCart()

        //??????????????????????????????????????????????????

        const reqUser = await fetch(`http://localhost:3000/api/userManagement/getUserInfo/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("userToken") || ''
            }
        })
        const resUser = await reqUser.json()
        console.log(resUser.userInfo)
        deliverName.textContent = resUser.userInfo.first_name + ' ' + resUser.userInfo.last_name
        deliverStreet.textContent = resUser.userInfo.address.street
        deliverCity.textContent = resUser.userInfo.address.city
        itemCounter.textContent = resCartItems.cartItems.length === 1 ? '1 Produkt' : resCartItems.cartItems.length + ' Produkte'
        itemCounterPrice.textContent = price + ",00 €"

        await ppCart()
    } catch (error) {
        console.log(error)
    }
})

async function ppCart() {
    paypal
        .Buttons({
            createOrder: function () {
                return fetch(
                    "http://localhost:3000/api/purchases/createCartPurchase",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": localStorage.getItem("userToken") || ''
                        },
                        body: JSON.stringify({
                            data: {
                                userId: localStorage.getItem('userId'),
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
                return actions.order.capture().then(async function (details) {
                    const completeOrder = await fetch('http://localhost:3000/api/purchases/completeCartPurchase', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("userToken") || ''
                        },
                        body: JSON.stringify({
                            userId: localStorage.getItem('userId'),
                            paypalOrderId: data.orderID
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

                const req = await fetch('http://localhost:3000/api/cartManagement/removeItem', {
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