const firstName = localStorage.getItem('user-letter') || ''

document.addEventListener('DOMContentLoaded', _ => {
    if (firstName !== '') {
        document.querySelector('.user-logged-in').innerHTML = `
            <span class="user-letter">${firstName[0]}</span>
        `
    }
})

