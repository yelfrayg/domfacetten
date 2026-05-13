document.addEventListener('DOMContentLoaded', _ => {
    setTimeout(() => {
        const firstName = localStorage.getItem('user-letter') || ''

        if (firstName !== '') {
            document.querySelector('.user-logged-in').innerHTML = `
            <span class="user-letter">${firstName[0]}</span>
        `
        }
    }, 500)
})

