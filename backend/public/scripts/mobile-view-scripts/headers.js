const menuSide = document.getElementById('side-menu');

document.addEventListener('DOMContentLoaded', () => {
    menuSide.addEventListener('click', () => {
        const hiddenMenu = document.querySelector('.mobile-menu');
        hiddenMenu.classList.toggle('active');
    });
});
