// Enhanced animations JavaScript for Narayan Tripathi's Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initializeAnimations();
    
    // Create scroll buttons
    createScrollButtons();
    
    // Add animated background to page headers
    addAnimatedBackgrounds();
    
    // Initialize particle effects
    initializeParticles();
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize wave backgrounds
    initializeWaveBackgrounds();
    
    // Initialize rotating elements
    initializeRotatingElements();
    
    // Initialize hover effects
    initializeHoverEffects();
});

// Initialize all animation elements
function initializeAnimations() {
    // Add floating animation to selected elements
    document.querySelectorAll('.logo img, .social-icon, .expertise-icon').forEach(element => {
        element.classList.add('float-animation');
    });
    
    // Add different floating speeds to various elements
    document.querySelectorAll('.hero-image img, .about-image img').forEach(element => {
        element.classList.add('float-animation-slow');
    });
    
    document.querySelectorAll('.news-card img, .project-card img').forEach(element => {
        element.classList.add('float-animation-fast');
    });
    
    // Add pulse animation to buttons and call-to-action elements
    document.querySelectorAll('.button, .cta-content h2, .featured-project h2').forEach(element => {
        element.classList.add('pulse-animation');
    });
    
    // Add subtle pulse to section headings
    document.querySelectorAll('.section-heading, .page-header h1').forEach(element => {
        element.classList.add('pulse-animation-subtle');
    });
    
    // Add shine effect to cards and project images
    document.querySelectorAll('.news-card, .expertise-card, .project-image, .featured-project').forEach(element => {
        element.classList.add('shine-effect');
    });
    
    // Add 3D effect to cards
    document.querySelectorAll('.news-card, .expertise-card, .project-card').forEach(element => {
        element.classList.add('card-3d-effect');
    });
    
    // Add animated underline to navigation links and read more links
    document.querySelectorAll('.main-navigation a, .read-more, .footer-links a').forEach(element => {
        element.classList.add('animated-underline');
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('.button, .news-tab, .refresh-button, .form-submit').forEach(element => {
        element.classList.add('ripple-effect');
    });
    
    // Add gradient border to featured elements
    document.querySelectorAll('.featured-project, .contact-form, .news-card, .cta-container').forEach(element => {
        element.classList.add('gradient-border');
    });
    
    // Add typing animation to hero section subtitle
    const heroSubtitle = document.querySelector('.hero-content p');
    if (heroSubtitle) {
        heroSubtitle.classList.add('typing-animation');
    }
    
    // Add glow effect to important elements
    document.querySelectorAll('.get-started .button, .cta-button, .featured-badge').forEach(element => {
        element.classList.add('glow-effect');
    });
    
    // Add bounce animation to attention-grabbing elements
    document.querySelectorAll('.notification-icon, .new-badge').forEach(element => {
        element.classList.add('bounce-animation');
    });
    
    // Add heartbeat animation to special elements
    document.querySelectorAll('.special-offer, .limited-time').forEach(element => {
        element.classList.add('heartbeat-animation');
    });
    
    // Add color change animation to selected text elements
    document.querySelectorAll('.highlight-text, .changing-stat').forEach(element => {
        element.classList.add('color-change');
    });
    
    // Add neon text effect to special headings
    document.querySelectorAll('.hero-heading, .special-heading').forEach(element => {
        element.classList.add('neon-text');
    });
    
    // Add wave background to sections
    document.querySelectorAll('.cta-section, .newsletter-section').forEach(element => {
        element.classList.add('wave-bg');
    });
}

// Create scroll-to-top and scroll-to-bottom buttons
function createScrollButtons() {
    // Create container for scroll buttons
    const scrollButtons = document.createElement('div');
    scrollButtons.className = 'scroll-buttons';
    
    // Create scroll-to-top button
    const scrollTop = document.createElement('div');
    scrollTop.className = 'scroll-top pulse-animation-subtle';
    scrollTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Create scroll-to-bottom button
    const scrollBottom = document.createElement('div');
    scrollBottom.className = 'scroll-bottom pulse-animation-subtle';
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
    const pageHeaders = document.querySelectorAll('.page-header, .hero-section, .cta-section, .featured-section');
    
    pageHeaders.forEach(header => {
        // Add animated background div
        const animatedBg = document.createElement('div');
        animatedBg.className = 'animated-bg';
        header.appendChild(animatedBg);
        
        // Add animated shapes
        const animatedShapes = document.createElement('div');
        animatedShapes.className = 'animated-shapes';
        
        // Create random shapes
        for (let i = 0; i < 8; i++) {
            createRandomShape(animatedShapes);
        }
        
        header.appendChild(animatedShapes);
    });
}

// Create random animated shape
function createRandomShape(container) {
    const shapes = ['shape-circle', 'shape-square', 'shape-triangle'];
    const shape = document.createElement('div');
    
    // Random shape type
    const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
    shape.className = `shape ${shapeType}`;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    shape.style.left = `${posX}%`;
    shape.style.top = `${posY}%`;
    
    // Random size
    const size = Math.random() * 100 + 50;
    shape.style.width = `${size}px`;
    shape.style.height = `${size}px`;
    
    // Random animation
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    shape.style.animation = `floating ${duration}s ease-in-out ${delay}s infinite alternate`;
    
    // Random opacity
    shape.style.opacity = Math.random() * 0.2 + 0.1;
    
    // Add to container
    container.appendChild(shape);
}

// Initialize particle effects
function initializeParticles() {
    const sections = document.querySelectorAll('.hero-section, .cta-section, .featured-section');
    
    sections.forEach(section => {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            createParticle(particlesContainer);
        }
        
        section.appendChild(particlesContainer);
    });
}

// Create a single particle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Random size
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random animation
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    particle.style.animation = `floating ${duration}s ease-in-out ${delay}s infinite alternate`;
    
    // Add to container
    container.appendChild(particle);
}

// Initialize scroll animations
function initializeScrollAnimations() {
    // Add fade-in-up class to elements that should animate on scroll
    document.querySelectorAll('.section-heading, .featured-project, .expertise-card, .news-card, .contact-form').forEach(element => {
        element.classList.add('fade-in-up');
    });
    
    // Add fade-in-left class to elements that should animate from left
    document.querySelectorAll('.about-content, .education-item:nth-child(odd), .project-description').forEach(element => {
        element.classList.add('fade-in-left');
    });
    
    // Add fade-in-right class to elements that should animate from right
    document.querySelectorAll('.about-image, .education-item:nth-child(even), .project-image').forEach(element => {
        element.classList.add('fade-in-right');
    });
    
    // Add stagger animation to lists
    document.querySelectorAll('.expertise-grid, .news-preview, .news-articles, .project-grid').forEach(element => {
        element.classList.add('stagger-animation');
    });
    
    // Check for elements in viewport on scroll
    checkElementsInViewport();
    window.addEventListener('scroll', checkElementsInViewport);
    window.addEventListener('resize', checkElementsInViewport);
}

// Check if elements are in viewport and add visible class
function checkElementsInViewport() {
    const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-down, .stagger-animation');
    
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

// Initialize wave backgrounds
function initializeWaveBackgrounds() {
    const sections = document.querySelectorAll('.newsletter-section, .cta-section, .site-footer');
    
    sections.forEach(section => {
        // Already has wave-bg class from CSS
        // Just need to ensure it has position relative
        if (getComputedStyle(section).position !== 'relative') {
            section.style.position = 'relative';
        }
    });
}

// Initialize rotating elements
function initializeRotatingElements() {
    // Add rotation animation to circular elements
    document.querySelectorAll('.circular-icon, .skill-badge').forEach((element, index) => {
        if (index % 2 === 0) {
            element.classList.add('rotate-animation');
        } else {
            element.classList.add('rotate-animation-reverse');
        }
    });
}

// Initialize hover effects
function initializeHoverEffects() {
    // Add hover lift effect to cards and buttons
    document.querySelectorAll('.news-card, .project-card, .expertise-card, .team-member').forEach(element => {
        element.classList.add('hover-lift');
    });
    
    // Add shake animation to notification elements on hover
    document.querySelectorAll('.notification-icon, .alert-message').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.classList.add('shake-animation');
            
            // Remove class after animation completes
            setTimeout(() => {
                this.classList.remove('shake-animation');
            }, 820); // Animation duration
        });
    });
    
    // Add wobble animation to logo on hover
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.classList.add('wobble-animation');
            
            // Remove class after animation completes
            setTimeout(() => {
                this.classList.remove('wobble-animation');
            }, 2000); // Animation duration
        });
    }
}

// Add dynamic background animations to all pages
document.addEventListener('DOMContentLoaded', function() {
    // Add rotating gradient background to selected sections
    document.querySelectorAll('.hero-section, .cta-section').forEach(section => {
        section.classList.add('rotating-gradient');
    });
    
    // Create dynamic background animations for all pages
    createDynamicBackgroundAnimations();
});

// Create dynamic background animations for all pages
function createDynamicBackgroundAnimations() {
    // Get all main content sections
    const mainSections = document.querySelectorAll('main section:not(.hero-section):not(.page-header)');
    
    mainSections.forEach((section, index) => {
        // Create a unique animation for each section based on its index
        const animationType = index % 4;
        
        switch(animationType) {
            case 0:
                // Add floating shapes
                addFloatingShapes(section);
                break;
            case 1:
                // Add parallax effect
                addParallaxEffect(section);
                break;
            case 2:
                // Add gradient background
                section.style.background = 'linear-gradient(135deg, rgba(26, 50, 99, 0.05) 0%, rgba(231, 76, 60, 0.05) 100%)';
                break;
            case 3:
                // Add subtle pattern
                section.style.backgroundImage = 'radial-gradient(rgba(26, 50, 99, 0.1) 1px, transparent 1px)';
                section.style.backgroundSize = '20px 20px';
                break;
        }
    });
}

// Add floating shapes to a section
function addFloatingShapes(section) {
    // Create container for shapes
    const shapesContainer = document.createElement('div');
    shapesContainer.className = 'animated-shapes';
    shapesContainer.style.opacity = '0.05';
    
    // Create shapes
    for (let i = 0; i < 5; i++) {
        createRandomShape(shapesContainer);
    }
    
    // Add container to section
    section.style.position = 'relative';
    section.style.overflow = 'hidden';
    section.appendChild(shapesContainer);
}

// Add parallax effect to a section
function addParallaxEffect(section) {
    // Only add to sections with background images
    const computedStyle = getComputedStyle(section);
    if (computedStyle.backgroundImage !== 'none' && !computedStyle.backgroundImage.includes('gradient')) {
        section.classList.add('parallax-section');
    }
}

// Add zoom effect to images on hover
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.project-image img, .news-card img, .team-member img');
    
    images.forEach(image => {
        // Create wrapper if needed
        if (!image.parentElement.classList.contains('image-zoom-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-zoom-wrapper';
            wrapper.style.overflow = 'hidden';
            
            // Replace image with wrapper containing image
            image.parentNode.insertBefore(wrapper, image);
            wrapper.appendChild(image);
        }
        
        // Add transition to image
        image.style.transition = 'transform 0.5s ease';
        
        // Add hover effect
        image.parentElement.addEventListener('mouseenter', function() {
            image.style.transform = 'scale(1.1)';
        });
        
        image.parentElement.addEventListener('mouseleave', function() {
            image.style.transform = 'scale(1)';
        });
    });
});
