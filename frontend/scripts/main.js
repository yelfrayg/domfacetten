// document.addEventListener('DOMContentLoaded', _ => {
//     // Session weiter eine Minute Counten
//     const sessionTimeout = 1000  * 60; // 60 Minuten
//     const firstName = localStorage.getItem('user-letter') || ''
//     if (!localStorage.getItem('sessionTimeout')) {
//         localStorage.setItem('sessionTimeout', Date.now() + sessionTimeout);
//     }

//     if (localStorage.getItem('sessionTimeout') && Date.now() > localStorage.getItem('sessionTimeout')) {
//         localStorage.removeItem('sessionTimeout');
//         localStorage.removeItem('user-letter');
//     }

//     if (firstName !== '') {
//         document.querySelector('.user-logged-in').innerHTML = `
//                 <span class="user-letter">${firstName[0]}</span>
//             `
//     }
// })

