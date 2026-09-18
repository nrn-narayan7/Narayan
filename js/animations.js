// Scroll button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create scroll buttons
    createScrollButtons();
    
    // Add animated background to page headers
    addAnimatedBackgrounds();
});

// Create scroll-to-top and scroll-to-bottom buttons
function createScrollButtons() {
    // Create container for scroll buttons
    const scrollButtons = document.createElement('div');
    scrollButtons.className = 'scroll-buttons';
    
    // Create scroll-to-top button
    const scrollTop = document.createElement('div');
    scrollTop.className = 'scroll-top';
    scrollTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Create scroll-to-bottom button
    const scrollBottom = document.createElement('div');
    scrollBottom.className = 'scroll-bottom';
    scrollBottom.innerHTML = '<i class="fas fa-chevron-down"></i>';
    scrollBottom.addEventListener('click', function() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });
    
    // Add buttons to container
    scrollButtons.appendChild(scrollTop);
    scrollButtons.appendChild(scrollBottom);
    
    // Add container to body
    document.body.appendChild(scrollButtons);
    
    // Show/hide scroll-to-top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTop.style.display = 'flex';
        } else {
            scrollTop.style.display = 'none';
        }
        
        // Hide scroll-to-bottom button when near the bottom
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 300) {
            scrollBottom.style.display = 'none';
        } else {
            scrollBottom.style.display = 'flex';
        }
    });
    
    // Initial state
    scrollTop.style.display = 'none';
}

// Add animated backgrounds to page headers
function addAnimatedBackgrounds() {
    const pageHeaders = document.querySelectorAll('.page-header');
    
    pageHeaders.forEach(header => {
        // Add animated background div
        const animatedBg = document.createElement('div');
        animatedBg.className = 'animated-bg';
        header.appendChild(animatedBg);
    });
}
