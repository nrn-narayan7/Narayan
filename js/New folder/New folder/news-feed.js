// Enhanced News Feed JavaScript with Search Functionality and Fixed Image Loading

document.addEventListener('DOMContentLoaded', function() {
    // Initialize news feed if present on page
    const newsFeed = document.getElementById('news-feed');
    if (newsFeed) {
        initializeNewsFeed();
        setupRefreshButton();
        setupSearchFunctionality();
    }
    
    // Initialize newsletter form if present
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        setupNewsletterForm();
    }
    
    // Handle article links from URL
    handleArticleFromUrl();
});

// Initialize news feed with categories and articles
function initializeNewsFeed() {
    const newsFeed = document.getElementById('news-feed');
    
    // Display loading state
    newsFeed.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Loading latest news...</p></div>';
    
    // Create notification popup container if it doesn't exist
    if (!document.getElementById('notification-popup')) {
        const popupContainer = document.createElement('div');
        popupContainer.id = 'notification-popup';
        popupContainer.className = 'notification-popup';
        popupContainer.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div class="notification-content">
                <h4>Notification</h4>
                <p>Message goes here</p>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
            <div class="notification-progress"></div>
        `;
        document.body.appendChild(popupContainer);
        
        // Add event listener to close button
        popupContainer.querySelector('.notification-close').addEventListener('click', function() {
            hideNotification();
        });
    }
    
    // Fetch news articles (simulated API call)
    setTimeout(() => {
        const articles = getNewsArticles();
        displayNewsArticles(articles);
        updateLastUpdatedTime();
        
        // Set up auto-refresh every day (in milliseconds)
        // For demo purposes, we'll use a shorter interval
        const refreshInterval = 24 * 60 * 60 * 1000; // 24 hours
        setInterval(() => {
            refreshNewsFeed(true); // true for auto refresh
        }, refreshInterval);
    }, 1500);
}

// Handle article from URL
function handleArticleFromUrl() {
    // Check if URL contains article ID
    const urlPath = window.location.pathname;
    const articleMatch = urlPath.match(/\/article\/(\d+)/);
    
    if (articleMatch && articleMatch[1]) {
        const articleId = parseInt(articleMatch[1]);
        openArticleViewer(articleId);
    }
}

// Setup search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('news-search');
    const searchButton = document.getElementById('search-button');
    const topicFilter = document.getElementById('topic-filter');
    const dateFilter = document.getElementById('date-filter');
    
    if (!searchInput || !searchButton || !topicFilter || !dateFilter) return;
    
    // Search button click event
    searchButton.addEventListener('click', function() {
        performSearch();
    });
    
    // Enter key press in search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filter change events
    topicFilter.addEventListener('change', performSearch);
    dateFilter.addEventListener('change', performSearch);
    
    // Perform search function
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const topicValue = topicFilter.value;
        const dateValue = dateFilter.value;
        
        // Get all articles
        const articles = getNewsArticles();
        
        // Filter articles based on search criteria
        const filteredArticles = articles.filter(article => {
            // Search term filter
            const matchesSearch = searchTerm === '' || 
                article.title.toLowerCase().includes(searchTerm) || 
                article.summary.toLowerCase().includes(searchTerm) ||
                article.source.toLowerCase().includes(searchTerm);
            
            // Topic filter
            let matchesTopic = topicValue === 'all';
            
            if (topicValue === 'other') {
                // For "Other" category, include articles that don't match the main categories
                const mainCategories = ['geomatics', 'ai', 'remote-sensing', 'gis', 'technology', 
                                       'drone', 'lidar', 'photogrammetry', 'spatial-analysis', 'cartography'];
                matchesTopic = !mainCategories.includes(article.subcategory.toLowerCase());
            } else if (topicValue !== 'all') {
                matchesTopic = article.subcategory.toLowerCase() === topicValue;
            }
            
            // Date filter
            let matchesDate = true;
            if (dateValue !== 'all') {
                const articleDate = new Date(article.date);
                const now = new Date();
                
                switch (dateValue) {
                    case 'today':
                        matchesDate = isSameDay(articleDate, now);
                        break;
                    case 'this-week':
                        matchesDate = isWithinDays(articleDate, now, 7);
                        break;
                    case 'this-month':
                        matchesDate = isWithinDays(articleDate, now, 30);
                        break;
                }
            }
            
            return matchesSearch && matchesTopic && matchesDate;
        });
        
        // Display filtered articles
        displayNewsArticles(filteredArticles);
        
        // Update results count
        updateResultsCount(filteredArticles.length);
    }
}

// Setup refresh button
function setupRefreshButton() {
    const refreshButton = document.getElementById('refresh-button');
    if (!refreshButton) return;
    
    refreshButton.addEventListener('click', function() {
        refreshNewsFeed(false); // false for manual refresh
    });
}

// Refresh news feed
function refreshNewsFeed(isAutoRefresh) {
    const newsFeed = document.getElementById('news-feed');
    
    // Show loading spinner
    newsFeed.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Refreshing news...</p></div>';
    
    // Simulate API call delay
    setTimeout(() => {
        const articles = getNewsArticles();
        displayNewsArticles(articles);
        updateLastUpdatedTime();
        
        // Reset filters
        const searchInput = document.getElementById('news-search');
        const topicFilter = document.getElementById('topic-filter');
        const dateFilter = document.getElementById('date-filter');
        
        if (searchInput) searchInput.value = '';
        if (topicFilter) topicFilter.value = 'all';
        if (dateFilter) dateFilter.value = 'all';
        
        // Show notification
        if (!isAutoRefresh) {
            showNotification('News Refreshed', 'The latest news articles have been loaded.', 'success');
        }
    }, 1500);
}

// Display news articles
function displayNewsArticles(articles) {
    const newsFeed = document.getElementById('news-feed');
    
    // Clear existing content
    newsFeed.innerHTML = '';
    
    // Check if there are articles
    if (articles.length === 0) {
        newsFeed.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No articles found matching your criteria.</p></div>';
        return;
    }
    
    // Create articles container
    const articlesContainer = document.createElement('div');
    articlesContainer.className = 'news-articles';
    
    // Add articles
    articles.forEach(article => {
        const articleElement = createArticleElement(article);
        articlesContainer.appendChild(articleElement);
    });
    
    // Add to news feed
    newsFeed.appendChild(articlesContainer);
}

// Create article element
function createArticleElement(article) {
    const articleElement = document.createElement('div');
    articleElement.className = 'news-card';
    articleElement.dataset.id = article.id;
    
    // Format date
    const articleDate = new Date(article.date);
    const formattedDate = articleDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create image HTML
    const imageHtml = `
        <div class="article-image">
            <a href="javascript:void(0);" onclick="openArticleViewer(${article.id})">
                <img src="${article.image}" alt="${article.title}" onerror="this.src='images/fallback-news.jpg'">
            </a>
            <span class="article-category">${article.subcategory || 'News'}</span>
        </div>
    `;
    
    articleElement.innerHTML = `
        ${imageHtml}
        <div class="article-content">
            <span class="article-date">${formattedDate}</span>
            <h3><a href="javascript:void(0);" onclick="openArticleViewer(${article.id})">${article.title}</a></h3>
            <p>${article.summary}</p>
            <div class="article-source">
                <span>Source: ${article.source}</span>
                <a href="javascript:void(0);" onclick="openArticleViewer(${article.id})" class="read-more">Read Full Article</a>
            </div>
        </div>
    `;
    
    // Add image load event listener
    const img = articleElement.querySelector('img');
    if (img) {
        // Add loading class
        img.classList.add('loading');
        
        // Add load event listener
        img.addEventListener('load', function() {
            img.classList.remove('loading');
            img.classList.add('loaded');
        });
        
        // Add error event listener
        img.addEventListener('error', function() {
            img.classList.remove('loading');
            img.classList.add('error');
            // Set fallback image
            img.src = 'images/fallback-news.jpg';
        });
        
        // Preload image
        const preloadImg = new Image();
        preloadImg.src = article.image;
    }
    
    return articleElement;
}

// Setup newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    const statusElement = document.getElementById('newsletter-status');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value.trim();
        
        // Validate email
        if (!email || !isValidEmail(email)) {
            statusElement.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Please enter a valid email address.</div>';
            return;
        }
        
        // Show sending status
        statusElement.innerHTML = '<div class="sending-message"><i class="fas fa-spinner fa-spin"></i> Subscribing...</div>';
        
        // Simulate API call
        setTimeout(() => {
            // Success message
            statusElement.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Thank you for subscribing! You will now receive updates.</div>';
            
            // Reset form
            newsletterForm.reset();
            
            // Clear status after 5 seconds
            setTimeout(() => {
                statusElement.innerHTML = '';
            }, 5000);
        }, 1500);
    });
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get news articles data with expanded topics
function getNewsArticles() {
    // In a real implementation, this would fetch from news APIs
    // For demonstration, we're using expanded sample data
    return [
        {
            id: 1,
            title: "New Satellite Imagery Reveals Changes in Global Forest Cover",
            summary: "Recent analysis of satellite data shows significant changes in forest cover across the globe, with implications for climate change and biodiversity.",
            date: "2025-04-15",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            source: "GIS World",
            category: "Around the World",
            subcategory: "Environment"
        },
        {
            id: 2,
            title: "Advancements in LiDAR Technology for Urban Planning",
            summary: "New developments in LiDAR technology are revolutionizing urban planning by providing more accurate 3D models of cities.",
            date: "2025-04-10",
            image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1344&q=80",
            source: "Geospatial World",
            category: "Around the World",
            subcategory: "Technology"
        },
        {
            id: 3,
            title: "GPS Accuracy Improvements Coming with New Satellite Launch",
            summary: "The upcoming launch of new GPS satellites promises to improve location accuracy for everyday users and specialized applications.",
            date: "2025-04-05",
            image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            source: "Navigation News",
            category: "Around the World",
            subcategory: "Navigation"
        },
        {
            id: 4,
            title: "Remote Sensing Applications in Climate Change Monitoring",
            summary: "Scientists are using advanced remote sensing techniques to track climate change impacts with unprecedented precision.",
            date: "2025-04-02",
            image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            source: "Earth Observation Magazine",
            category: "Around the World",
            subcategory: "Climate"
        },
        {
            id: 5,
            title: "New Open-Source GIS Tools Transforming Humanitarian Response",
            summary: "Humanitarian organizations are leveraging new open-source GIS tools to improve disaster response and aid distribution.",
            date: "2025-04-18",
            image: "https://images.unsplash.com/photo-1527219525722-f9767a7f2884?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80",
            source: "Humanitarian Tech Review",
            category: "Around the World",
            subcategory: "GIS"
        },
        {
            id: 6,
            title: "Drone Mapping Techniques Revolutionize Archaeological Research",
            summary: "Archaeologists are using drone mapping to discover and document ancient sites that were previously inaccessible or unknown.",
            date: "2025-04-12",
            image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            source: "Digital Archaeology Journal",
            category: "Around the World",
            subcategory: "Remote Sensing"
        },
        {
            id: 7,
            title: "Nepal Launches First Geospatial Data Portal for Public Access",
            summary: "The Government of Nepal has launched a comprehensive geospatial data portal that provides public access to various spatial datasets.",
            date: "2025-04-17",
            image: "https://images.unsplash.com/photo-1544461772-722f2a1a21f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            source: "Kathmandu Post",
            category: "In Nepal",
            subcategory: "Government"
        },
        {
            id: 8,
            title: "Kathmandu Valley Mapping Project Completes High-Resolution Survey",
            summary: "A collaborative project has completed a high-resolution mapping survey of the Kathmandu Valley, providing valuable data for urban planning and disaster management.",
            date: "2025-04-12",
            image: "https://images.unsplash.com/photo-1558799401-7c3f139af685?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            source: "Nepal Times",
            category: "In Nepal",
            subcategory: "Urban Planning"
        },
        {
            id: 9,
            title: "Nepali Researchers Develop Low-Cost Drone for Agricultural Monitoring",
            summary: "A team of researchers from Tribhuvan University has developed a low-cost drone system specifically designed for agricultural monitoring in Nepal's diverse terrain.",
            date: "2025-04-08",
            image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            source: "TechLekh",
            category: "In Nepal",
            subcategory: "Innovation"
        },
        {
            id: 10,
            title: "Nepal's First Digital Cadastre System Launched in Pilot Districts",
            summary: "The Department of Land Management has launched Nepal's first digital cadastre system in selected pilot districts, aiming to modernize land records management.",
            date: "2025-04-03",
            image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1396&q=80",
            source: "Himalayan Times",
            category: "In Nepal",
            subcategory: "Land Management"
        },
        {
            id: 11,
            title: "Nepal Implements GIS-Based Disaster Risk Reduction System",
            summary: "Nepal has implemented a new GIS-based system for disaster risk reduction, helping communities prepare for and respond to natural disasters.",
            date: "2025-04-14",
            image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
            source: "Nepal Disaster Review",
            category: "In Nepal",
            subcategory: "Disaster Management"
        },
        {
            id: 12,
            title: "AI-Powered Geospatial Analysis Predicts Crop Yields in Nepal",
            summary: "A new AI-powered geospatial analysis system is helping Nepali farmers predict crop yields and optimize agricultural practices.",
            date: "2025-04-11",
            image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            source: "AgriTech Nepal",
            category: "In Nepal",
            subcategory: "AI"
        }
    ];
}

// Update last updated time
function updateLastUpdatedTime() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (!lastUpdatedElement) return;
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
}

// Update results count
function updateResultsCount(count) {
    const resultsCountElement = document.getElementById('results-count');
    if (!resultsCountElement) return;
    
    resultsCountElement.textContent = `${count} article${count !== 1 ? 's' : ''} found`;
}

// Show notification
function showNotification(title, message, type = 'info') {
    const popup = document.getElementById('notification-popup');
    if (!popup) return;
    
    // Set content
    popup.querySelector('h4').textContent = title;
    popup.querySelector('p').textContent = message;
    
    // Set type
    popup.className = `notification-popup ${type}`;
    
    // Show popup
    popup.style.display = 'flex';
    
    // Start progress bar
    const progressBar = popup.querySelector('.notification-progress');
    progressBar.style.width = '100%';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

// Hide notification
function hideNotification() {
    const popup = document.getElementById('notification-popup');
    if (!popup) return;
    
    popup.style.display = 'none';
}

// Date helper functions
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function isWithinDays(date1, date2, days) {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
}
