// JavaScript for Narayan Tripathi's Website - Fixed Version


document.addEventListener('scroll', function() {
    const baseLayer = document.querySelector('.layer-base');
    const mapLayer = document.querySelector('.layer-map');
    const shapesLayer = document.querySelector('.layer-shapes');
    const scrollPosition = window.scrollY;

    // Parallax speeds for each layer (adjust multipliers)
    baseLayer.style.transform = `translateY(${scrollPosition * 0.2}px)`;
    mapLayer.style.transform = `translateY(${scrollPosition * 0.4}px)`;
    shapesLayer.style.transform = `translateY(${scrollPosition * 0.6}px)`;
});

// Mouse-based tilt effect
document.addEventListener('mousemove', function(e) {
    const heroSection = document.querySelector('.hero-section');
    const baseLayer = document.querySelector('.layer-base');
    const mapLayer = document.querySelector('.layer-map');
    const shapesLayer = document.querySelector('.layer-shapes');

    // Get mouse position relative to window center
    const rect = heroSection.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;

    // Calculate tilt (adjust divisors for sensitivity)
    const tiltX = mouseY / centerY / 10; // Vertical tilt
    const tiltY = -mouseX / centerX / 10; // Horizontal tilt

    // Apply transforms with subtle movement
    baseLayer.style.transform = `translateY(${window.scrollY * 0.2}px) rotateX(${tiltX * 2}deg) rotateY(${tiltY * 2}deg)`;
    mapLayer.style.transform = `translateY(${window.scrollY * 0.4}px) rotateX(${tiltX * 4}deg) rotateY(${tiltY * 4}deg)`;
    shapesLayer.style.transform = `translateY(${window.scrollY * 0.6}px) rotateX(${tiltX * 6}deg) rotateY(${tiltY * 6}deg)`;
});
document.addEventListener('DOMContentLoaded', function() {
    // Initialize timeline items immediately without animation classes
    initializeTimeline();
    
    // Mobile Navigation Toggle
    const setupMobileNav = () => {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-navigation');
        
        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', function() {
                mainNav.classList.toggle('active');
                this.classList.toggle('active');
            });
        }
    };

    // Smooth Scrolling for Anchor Links
    const setupSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // Form Validation
    const setupFormValidation = () => {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                // Form is now set up to use direct email sending
                // We'll still validate before submission
                
                let valid = true;
                const name = document.getElementById('name');
                const email = document.getElementById('email');
                const message = document.getElementById('message');
                
                if (name && name.value.trim() === '') {
                    valid = false;
                    name.classList.add('error');
                } else if (name) {
                    name.classList.remove('error');
                }
                
                if (email && (email.value.trim() === '' || !email.value.includes('@'))) {
                    valid = false;
                    email.classList.add('error');
                } else if (email) {
                    email.classList.remove('error');
                }
                
                if (message && message.value.trim() === '') {
                    valid = false;
                    message.classList.add('error');
                } else if (message) {
                    message.classList.remove('error');
                }
                
                if (!valid) {
                    e.preventDefault();
                    alert('Please fill in all required fields correctly.');
                }
            });
        }
    };

    // Initialize Timeline Items - Fixed to ensure visibility
    function initializeTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        if (timelineItems.length > 0) {
            timelineItems.forEach((item) => {
                // Remove any animation classes that might be causing issues
                item.classList.remove('animate__animated', 'animate__fadeInUp', 'animate-timeline');
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                
                // Ensure the content is visible
                const content = item.querySelector('.timeline-content');
                if (content) {
                    content.style.opacity = '1';
                    content.style.display = 'block';
                }
            });
        }
    }

    // News Feed Functionality
    const setupNewsFeed = () => {
        const newsFeed = document.getElementById('news-feed');
        if (!newsFeed) return;
        
        // Display loading state
        newsFeed.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Loading latest news...</p></div>';
        
        // Fetch news articles
        fetchNewsArticles();
    };

    // Fetch news articles from various sources
    function fetchNewsArticles() {
        // In a real implementation, this would fetch from news APIs
        // For demonstration, we'll use sample data
        
        // Simulate API delay
        setTimeout(() => {
            displayNewsArticles(sampleNewsArticles);
            
            // Set up auto-refresh every 30 minutes (in milliseconds)
            setInterval(() => {
                const newsFeed = document.getElementById('news-feed');
                if (newsFeed) {
                    newsFeed.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Refreshing news...</p></div>';
                    setTimeout(() => {
                        displayNewsArticles(sampleNewsArticles);
                    }, 1000);
                }
            }, 30 * 60 * 1000);
        }, 1500);
    }

    // Display news articles in the feed
    function displayNewsArticles(articles) {
        const newsFeed = document.getElementById('news-feed');
        if (!newsFeed) return;
        
        // Clear loading spinner
        newsFeed.innerHTML = '';
        
        // Create category tabs
        const categories = [...new Set(articles.map(article => article.category))];
        
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'news-tabs';
        
        categories.forEach((category, index) => {
            const tab = document.createElement('button');
            tab.className = index === 0 ? 'news-tab active' : 'news-tab';
            tab.textContent = category;
            tab.dataset.category = category;
            tab.addEventListener('click', function() {
                // Update active tab
                document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Filter articles by category
                filterArticlesByCategory(category);
            });
            
            tabsContainer.appendChild(tab);
        });
        
        newsFeed.appendChild(tabsContainer);
        
        // Create articles container
        const articlesContainer = document.createElement('div');
        articlesContainer.className = 'news-articles';
        articlesContainer.id = 'news-articles';
        newsFeed.appendChild(articlesContainer);
        
        // Show articles for first category by default
        filterArticlesByCategory(categories[0]);
    }

    // Filter articles by category
    function filterArticlesByCategory(category) {
        const articlesContainer = document.getElementById('news-articles');
        if (!articlesContainer) return;
        
        // Filter articles
        const filteredArticles = sampleNewsArticles.filter(article => article.category === category);
        
        // Clear container
        articlesContainer.innerHTML = '';
        
        // Add articles
        filteredArticles.forEach(article => {
            const articleElement = createArticleElement(article);
            articlesContainer.appendChild(articleElement);
        });
    }

    // Create article element
    function createArticleElement(article) {
        const articleElement = document.createElement('div');
        articleElement.className = 'news-article animate__animated animate__fadeIn';
        
        const date = new Date(article.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        articleElement.innerHTML = `
            <div class="article-image">
                <a href="${article.url}" target="_blank">
                    <img src="${article.image}" alt="${article.title}">
                </a>
            </div>
            <div class="article-content">
                <span class="article-date">${formattedDate}</span>
                <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                <p>${article.summary}</p>
                <div class="article-source">
                    <span>Source: ${article.source}</span>
                    <a href="${article.url}" target="_blank" class="read-more">Read Full Article</a>
                </div>
            </div>
        `;
        
        return articleElement;
    }

    // Sample news articles data
    const sampleNewsArticles = [
        {
            title: "New Satellite Imagery Reveals Changes in Global Forest Cover",
            summary: "Recent analysis of satellite data shows significant changes in forest cover across the globe, with implications for climate change and biodiversity.",
            date: "2025-04-15",
            image: "https://via.placeholder.com/300x200?text=Satellite+Imagery",
            url: "https://example.com/satellite-imagery-forest-cover",
            source: "GIS World",
            category: "Geomatics"
        },
        {
            title: "Advancements in LiDAR Technology for Urban Planning",
            summary: "New developments in LiDAR technology are revolutionizing urban planning by providing more accurate 3D models of cities.",
            date: "2025-04-10",
            image: "https://via.placeholder.com/300x200?text=LiDAR+Technology",
            url: "https://example.com/lidar-urban-planning",
            source: "Geospatial World",
            category: "Geomatics"
        },
        {
            title: "GPS Accuracy Improvements Coming with New Satellite Launch",
            summary: "The upcoming launch of new GPS satellites promises to improve location accuracy for everyday users and specialized applications.",
            date: "2025-04-05",
            image: "https://via.placeholder.com/300x200?text=GPS+Satellites",
            url: "https://example.com/gps-accuracy-improvements",
            source: "Navigation News",
            category: "Geomatics"
        },
        {
            title: "Machine Learning Models Improve Flood Prediction Accuracy",
            summary: "Researchers have developed new machine learning models that significantly improve the accuracy of flood predictions using geospatial data.",
            date: "2025-04-18",
            image: "https://via.placeholder.com/300x200?text=Flood+Prediction",
            url: "https://example.com/ml-flood-prediction",
            source: "AI in Geoscience",
            category: "AI Technology"
        },
        {
            title: "AI-Powered Image Recognition for Automated Map Updates",
            summary: "New AI systems can automatically detect and categorize changes in satellite imagery, enabling faster and more accurate map updates.",
            date: "2025-04-12",
            image: "https://via.placeholder.com/300x200?text=AI+Map+Updates",
            url: "https://example.com/ai-map-updates",
            source: "Tech Innovations",
            category: "AI Technology"
        },
        {
            title: "Neural Networks Revolutionize Land Cover Classification",
            summary: "Deep learning neural networks are achieving unprecedented accuracy in classifying land cover from satellite imagery.",
            date: "2025-04-08",
            image: "https://via.placeholder.com/300x200?text=Neural+Networks",
            url: "https://example.com/neural-networks-land-cover",
            source: "AI Research Journal",
            category: "AI Technology"
        },
        {
            title: "Drone Mapping Techniques for Precision Agriculture",
            summary: "Farmers are adopting drone mapping technologies to monitor crop health and optimize resource usage.",
            date: "2025-04-17",
            image: "https://via.placeholder.com/300x200?text=Drone+Mapping",
            url: "https://example.com/drone-mapping-agriculture",
            source: "AgTech Today",
            category: "Technology"
        },
        {
            title: "Blockchain Applications in Land Registry Systems",
            summary: "Several countries are piloting blockchain-based land registry systems to improve transparency and reduce fraud.",
            date: "2025-04-14",
            image: "https://via.placeholder.com/300x200?text=Blockchain+Registry",
            url: "https://example.com/blockchain-land-registry",
            source: "Digital Governance",
            category: "Technology"
        },
        {
            title: "Augmented Reality for Field Data Collection",
            summary: "New AR applications are making field data collection more efficient and accurate for geospatial professionals.",
            date: "2025-04-09",
            image: "https://via.placeholder.com/300x200?text=AR+Data+Collection",
            url: "https://example.com/ar-field-data-collection",
            source: "Tech Trends",
            category: "Technology"
        }
    ];

    // Animation on Scroll
    const setupScrollAnimations = () => {
        // This would be implemented with a library like AOS
        // For now, we'll just add a placeholder function
        console.log('Scroll animations ready');
    };

    // Initialize all functions
    setupMobileNav();
    setupSmoothScrolling();
    setupFormValidation();
    setupNewsFeed();
    setupScrollAnimations();
});
