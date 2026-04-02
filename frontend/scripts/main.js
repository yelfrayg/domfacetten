const burger = document.querySelector('.header-burger');

burger.addEventListener('click', () => {
    document.querySelector('.mobile-menu').classList.toggle('active');
});