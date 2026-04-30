const deliverName = document.querySelector('.delivery-name')
const deliverStreet = document.querySelector('.delivery-street')
const deliverCity = document.querySelector('.delivery-city')

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
        if(reqCartItems.status == 401){
            alert('Access denied!')
            window.location = "/productPage.html"
        }
        console.log(resCartItems)


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
        // console.log(resUser)
    } catch (error) {
        console.log(error)
    }
})