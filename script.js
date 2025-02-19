// script.js

// Select all anchor links that have a href starting with "#"
const links = document.querySelectorAll('a[href^="#"]');

// Loop through each link and add an event listener for the 'click' event
links.forEach(link => {
    link.addEventListener('click', function (e) {
        // Prevent the default action (which is to jump to the section)
        e.preventDefault();

        // Get the target element (the section we are scrolling to)
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        // Use window.scrollTo to scroll to the target element smoothly
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});
