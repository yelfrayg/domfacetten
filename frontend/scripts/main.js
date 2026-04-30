const firstName = localStorage.getItem('user-letter') || ''
console.log(firstName + '   ' + firstName[0])

document.addEventListener('DOMContentLoaded', _ => {
    if (firstName !== '') {
        document.querySelector('.user-logged-in').innerHTML = `
            <span class="user-letter">${firstName[0]}</span>
        `
    }
})

