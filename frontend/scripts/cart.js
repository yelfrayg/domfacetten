const deliverName = document.querySelector('.delivery-name')
const deliverStreet = document.querySelector('.delivery-street')
const deliverCity = document.querySelector('.delivery-city')
const cartItemsContainer = document.querySelector('#cart-items')
const totalPrice = document.getElementById('total-price')
const paypalContainer = document.getElementById('paypal')

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
            alert('Access denied!')
            window.location = "/productPage.html"
            return
        }
        console.log(resCartItems.cartItems)
        let price = 0
        totalPrice.textContent = price + ',00 $'
        resCartItems.cartItems.forEach(element => {

            const cartEntry = document.createElement('tr')
            cartEntry.classList.add('single-cart-item')
            cartEntry.innerHTML = `
                <td class="artnr">${element.product.arttype || 'A'}${String(element.product.artnr).padStart(3, '0')}</td>
                <td class="artname">${element.product.name}</td>
                <td class="quantity">${element.quantity}</td>
                <td class="item-price">${element.product.price} €</td>
                <td><button class="delete-btn">x</button></td>
            `
            cartItemsContainer.appendChild(cartEntry)
            price += parseInt(element.product.price)
            totalPrice.textContent = price + ',00 $'
        });


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