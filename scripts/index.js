const body = document.querySelector('body');
const musicBoxes = document.querySelectorAll('.musicBox');

const heroScrollIcon = document.querySelector('#heroScrollIcon');

musicBoxes.forEach(box => {
    box.addEventListener('mouseover', () => {
        body.style.transition = `all ease 1s`;
        body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url(${box.firstChild.getAttribute("src")}`;
    })
});

heroScrollIcon.addEventListener('click', () => {
    document.getElementById("currentlyListening").scrollIntoView()
})