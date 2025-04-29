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
        try {
            const articles = getNewsArticles();
            displayNewsArticles(articles);
            updateLastUpdatedTime();
            
            // Store articles in localStorage for comparison during refresh
            localStorage.setItem('cachedArticles', JSON.stringify(articles));
            
            // Set up auto-refresh every day (in milliseconds)
            const refreshInterval = 24 * 60 * 60 * 1000; // 24 hours
            
            // For demo purposes, we can use a shorter interval (5 minutes)
            // const refreshInterval = 5 * 60 * 1000; // 5 minutes
            
            // Clear any existing interval
            if (window.autoRefreshInterval) {
                clearInterval(window.autoRefreshInterval);
            }
            
            // Set new interval
            window.autoRefreshInterval = setInterval(() => {
                refreshNewsFeed(true); // true for auto refresh
            }, refreshInterval);
            
            // Log next refresh time
            const nextRefresh = new Date(Date.now() + refreshInterval);
            console.log(`Next automatic refresh scheduled for: ${nextRefresh.toLocaleString()}`);
            
            // Show success notification
            showNotification('success', 'Content Loaded', 'News articles have been loaded successfully.');
        } catch (error) {
            console.error('Error initializing news feed:', error);
            newsFeed.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Error loading news. Please try again later.</div>';
            showNotification('error', 'Error Loading News', 'There was a problem loading the news articles. Please try again later.');
        }
    }, 1500);
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
            const matchesTopic = topicValue === 'all' || 
                article.subcategory.toLowerCase() === topicValue;
            
            // Date filter
            let matchesDate = true;
            if (dateValue !== 'all') {
                const articleDate = new Date(article.date);
                const now = new Date();
                
                switch(dateValue) {
                    case 'today':
                        matchesDate = articleDate.toDateString() === now.toDateString();
                        break;
                    case 'week':
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(now.getDate() - 7);
                        matchesDate = articleDate >= oneWeekAgo;
                        break;
                    case 'month':
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(now.getMonth() - 1);
                        matchesDate = articleDate >= oneMonthAgo;
                        break;
                    case 'year':
                        const oneYearAgo = new Date();
                        oneYearAgo.setFullYear(now.getFullYear() - 1);
                        matchesDate = articleDate >= oneYearAgo;
                        break;
                }
            }
            
            return matchesSearch && matchesTopic && matchesDate;
        });
        
        // Display filtered articles
        updateArticlesDisplay(filteredArticles);
        
        // Show search results notification
        if (searchTerm || topicValue !== 'all' || dateValue !== 'all') {
            const resultsCount = filteredArticles.length;
            const searchCriteria = [];
            
            if (searchTerm) searchCriteria.push(`"${searchTerm}"`);
            if (topicValue !== 'all') searchCriteria.push(topicValue);
            if (dateValue !== 'all') searchCriteria.push(dateValue.replace('-', ' '));
            
            const criteriaText = searchCriteria.join(', ');
            
            showNotification(
                'info', 
                'Search Results', 
                `Found ${resultsCount} article${resultsCount !== 1 ? 's' : ''} matching ${criteriaText}.`
            );
        }
    }
}

// Setup refresh button functionality
function setupRefreshButton() {
    const refreshButton = document.getElementById('refresh-news');
    if (!refreshButton) return;
    
    refreshButton.addEventListener('click', function() {
        refreshNewsFeed(false); // false for manual refresh
    });
}

// Refresh news feed with updated articles
function refreshNewsFeed(isAutoRefresh = false) {
    const newsFeed = document.getElementById('news-feed');
    if (!newsFeed) return;
    
    // Update button state
    const refreshButton = document.getElementById('refresh-news');
    if (refreshButton) {
        refreshButton.classList.add('refreshing');
        refreshButton.disabled = true;
    }
    
    // Show refreshing notification
    const notificationElement = document.getElementById('refresh-notification');
    if (notificationElement) {
        notificationElement.classList.add('show');
        notificationElement.querySelector('#notification-message').textContent = 'Refreshing content...';
    }
    
    // Simulate API delay
    setTimeout(() => {
        try {
            // Get new articles
            const articles = getNewsArticles();
            
            // Check if we have new content by comparing with cached articles
            let hasNewContent = true;
            const cachedArticlesJson = localStorage.getItem('cachedArticles');
            
            if (cachedArticlesJson) {
                try {
                    const cachedArticles = JSON.parse(cachedArticlesJson);
                    
                    // For demo purposes, we'll randomly decide if there's new content
                    // In a real implementation, you would compare the articles from the API
                    // Always refresh display, remove random check. Proper check needed for 'new content' message.
                    hasNewContent = true; // Assume new content for display update
                    
                    if (hasNewContent) {
                        // Update the cached articles
                        localStorage.setItem('cachedArticles', JSON.stringify(articles));
                    }
                } catch (e) {
                    console.error('Error parsing cached articles:', e);
                    // If there's an error parsing, assume we have new content
                    hasNewContent = true;
                    localStorage.setItem('cachedArticles', JSON.stringify(articles));
                }
            } else {
                // No cached articles, so this is new content
                localStorage.setItem('cachedArticles', JSON.stringify(articles));
            }
            
            if (hasNewContent) {
                // Shuffle articles to simulate new content
                const shuffledArticles = [...articles].sort(() => Math.random() - 0.5);
                
                // Update the displayed articles
                const activeTab = document.querySelector('.news-tab.active');
                const activeCategory = activeTab ? activeTab.dataset.category : 'Around the World';
                
                // Filter and display articles
                const filteredArticles = shuffledArticles.filter(article => article.category === activeCategory);
                updateArticlesDisplay(filteredArticles);
                
                // Show success notification
                if (notificationElement) {
                    notificationElement.classList.add('show');
                    notificationElement.querySelector('#notification-message').textContent = 'Content updated successfully!';
                }
                
                // Show popup notification
                showNotification('success', 'Content Updated', 'New articles have been loaded successfully.');
                
                // Update last updated time
                updateLastUpdatedTime();
            } else {
                // Show no new content notification
                if (notificationElement) {
                    notificationElement.classList.add('show');
                    notificationElement.querySelector('#notification-message').textContent = 'No new content available.';
                }
                
                // Show popup notification
                showNotification('info', 'No New Content', 'There are no new articles available at this time.');
            }
        } catch (error) {
            console.error('Error refreshing content:', error);
            
            // Show error notification
            if (notificationElement) {
                notificationElement.classList.add('show');
                notificationElement.querySelector('#notification-message').textContent = 'Error refreshing content.';
            }
            
            // Show popup notification
            showNotification('error', 'Refresh Error', 'There was a problem refreshing the content. Please try again later.');
        } finally {
            // Reset button state
            if (refreshButton) {
                refreshButton.classList.remove('refreshing');
                refreshButton.disabled = false;
            }
            
            // Hide notification after delay
            setTimeout(() => {
                if (notificationElement) {
                    notificationElement.classList.remove('show');
                }
            }, 3000);
        }
    }, 2000);
}

// Show notification popup
function showNotification(type, title, message) {
    const popup = document.getElementById('notification-popup');
    if (!popup) return;
    
    // Set notification type
    popup.className = 'notification-popup ' + type;
    
    // Update icon
    const iconElement = popup.querySelector('i:first-child');
    if (iconElement) {
        iconElement.className = type === 'success' ? 'fas fa-check-circle' : 
                               type === 'error' ? 'fas fa-exclamation-circle' : 
                               'fas fa-info-circle';
    }
    
    // Update content
    const titleElement = popup.querySelector('h4');
    const messageElement = popup.querySelector('p');
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    
    // Show notification
    popup.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

// Hide notification popup
function hideNotification() {
    const popup = document.getElementById('notification-popup');
    if (popup) {
        popup.classList.remove('show');
    }
}

// Update last updated time
function updateLastUpdatedTime() {
    const timeElement = document.getElementById('last-updated-time');
    if (timeElement) {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedDate = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        timeElement.textContent = `${formattedDate} at ${formattedTime}`;
        
        // Also store the timestamp in localStorage for persistence
        localStorage.setItem('lastUpdatedTime', now.toISOString());
    }
}

// Display news articles with category tabs
function displayNewsArticles(articles) {
    const newsFeed = document.getElementById('news-feed');
    if (!newsFeed) return;
    
    // Clear loading spinner
    newsFeed.innerHTML = '';
    
    // Create category tabs
    const categories = ['Around the World', 'In Nepal', 'What\'s Buzzing'];
    
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
            const filteredArticles = articles.filter(article => article.category === category);
            updateArticlesDisplay(filteredArticles);
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
    const filteredArticles = articles.filter(article => article.category === categories[0]);
    updateArticlesDisplay(filteredArticles);
}

// Update the articles display with filtered articles
function updateArticlesDisplay(articles) {
    const articlesContainer = document.getElementById('news-articles');
    if (!articlesContainer) return;
    
    // Clear container
    articlesContainer.innerHTML = '';
    
    if (articles.length === 0) {
        // Show no content message
        articlesContainer.innerHTML = `
            <div class="no-content">
                <i class="fas fa-newspaper"></i>
                <h3>No Articles Found</h3>
                <p>There are no articles available in this category at the moment. Please check back later or try another category.</p>
            </div>
        `;
        return;
    }
    
    // Add articles with staggered animation
    articles.forEach((article, index) => {
        const articleElement = createArticleElement(article);
        
        // Add staggered animation delay
        articleElement.style.animationDelay = `${index * 0.1}s`;
        
        articlesContainer.appendChild(articleElement);
    });
}

// Create article element with improved image loading
function createArticleElement(article) {
    const articleElement = document.createElement('div');
    articleElement.className = 'news-article animate__animated animate__fadeIn';
    
    const date = new Date(article.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create image element with proper error handling
    const imageHtml = `
        <div class="article-image">
            <a href="javascript:void(0);" onclick="return false;">
                <img src="${article.image}" alt="${article.title}" 
                     onerror="this.onerror=null; this.src='images/news-fallback.jpg';">
            </a>
            <span class="article-category">${article.subcategory || 'News'}</span>
        </div>
    `;
    
    articleElement.innerHTML = `
        ${imageHtml}
        <div class="article-content">
            <span class="article-date">${formattedDate}</span>
            <h3><a href="javascript:void(0);" onclick="return false;">${article.title}</a></h3>
            <p>${article.summary}</p>
            <div class="article-source">
                <span>Source: ${article.source}</span>
                <button class="read-more-btn" data-article-id="${article.id}">Read Full Article</button>
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
            img.src = 'images/news-fallback.jpg';
        });
        
        // Preload image
        const preloadImg = new Image();
        preloadImg.src = article.image;
    }
    
    // Add event listener for "Read Full Article" button
    const readMoreBtn = articleElement.querySelector('.read-more-btn');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                // The 'article' object is available in the scope of createArticleElement
                if (article && article.url) {
                    // Open the original article URL in a new tab
                    window.open(article.url, '_blank');
                } else {
                    console.error('Article object or URL not found for this button.');
                    showNotification('error', 'Error', 'Could not find the article link.');
                }
            } catch (error) {
                console.error('Error opening article link:', error);
                showNotification('error', 'Error', 'An error occurred while trying to open the article link.');
            }
        });
    }
    
    return articleElement;
}

// Show article modal for demo articles
function showArticleModal(article) {
    // Remove any existing modal
    const existingModal = document.getElementById('article-demo-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'article-demo-modal';
    modalContainer.className = 'article-modal';
    
    // Format date
    const date = new Date(article.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create modal content
    modalContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${article.title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="article-meta">
                    <span class="article-date">${formattedDate}</span>
                    <span class="article-source">Source: ${article.source}</span>
                    <span class="article-category">Category: ${article.subcategory}</span>
                </div>
                <div class="article-image-container">
                    <img src="${article.image}" alt="${article.title}" 
                         onerror="this.onerror=null; this.src='images/news-fallback.jpg';">
                </div>
                <div class="article-summary">
                    <h3>Summary</h3>
                    <p>${article.summary}</p>
                </div>
                <div class="article-full-content">
                    <h3>Full Article Content</h3>
                    <p>This is a demo article. In a real implementation, this would display the full content of the article fetched from the actual URL: <code>${article.url}</code></p>
                    <p>The article would typically contain multiple paragraphs of text, possibly with images, quotes, and other media elements.</p>
                    <p>For demonstration purposes, we're showing this placeholder content instead of redirecting to example.com.</p>
                </div>
                <div class="demo-notice">
                    <i class="fas fa-info-circle"></i>
                    <p>DEMO MODE: This is a simulated article view. In a production environment, clicking "Read Full Article" would open the actual article page in a new tab.</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listener to close button
    const closeButton = modalContainer.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            modalContainer.remove();
        });
    }
    
    // Close modal when clicking outside content
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
            modalContainer.remove();
        }
    });
    
    // Add modal styles if not already added
    if (!document.getElementById('modal-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'modal-styles';
        styleElement.textContent = `
            .article-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
                background-color: white;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                border-radius: 8px;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease;
            }
            
            .modal-header {
                padding: 16px 24px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                background-color: white;
                z-index: 1;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
                color: #333;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #777;
                transition: color 0.2s ease;
            }
            
            .modal-close:hover {
                color: #e74c3c;
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .article-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                margin-bottom: 20px;
                font-size: 0.9rem;
                color: #666;
            }
            
            .article-image-container {
                margin-bottom: 24px;
            }
            
            .article-image-container img {
                width: 100%;
                max-height: 400px;
                object-fit: cover;
                border-radius: 4px;
            }
            
            .article-summary, .article-full-content {
                margin-bottom: 24px;
            }
            
            .article-summary h3, .article-full-content h3 {
                margin-top: 0;
                color: #333;
                font-size: 1.2rem;
            }
            
            .demo-notice {
                background-color: #f8f9fa;
                border-left: 4px solid #3498db;
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-top: 24px;
                border-radius: 4px;
            }
            
            .demo-notice i {
                color: #3498db;
                font-size: 20px;
            }
            
            .demo-notice p {
                margin: 0;
                font-size: 0.9rem;
                color: #666;
            }
            
            code {
                background-color: #f5f5f5;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 0.9em;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                }
                
                .modal-header h2 {
                    font-size: 1.2rem;
                }
                
                .article-meta {
                    flex-direction: column;
                    gap: 8px;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }
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
            title: "New Satellite Imagery Reveals Changes in Global Forest Cover",
            summary: "Recent analysis of satellite data shows significant changes in forest cover across the globe, with implications for climate change and biodiversity.",
            date: "2025-04-15",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            url: "https://news.mongabay.com/2024/05/new-satellite-platform-monitors-deforestation-across-ecosystems-worldwide/",
            source: "GIS World",
            category: "Around the World",
            subcategory: "Environment"
        },
        {
            title: "Advancements in LiDAR Technology for Urban Planning",
            summary: "New developments in LiDAR technology are revolutionizing urban planning by providing more accurate 3D models of cities.",
            date: "2025-04-10",
            image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1344&q=80",
            url: "https://www.businesswire.com/news/home/20250318209338/en/LiDAR-Industry-Outlook-2033-Urban-Planning-is-Creating-Billion-Dollar-Opportunities-with-Smart-Cities-Fueling-LiDAR-Demand---ResearchAndMarkets.com",
            source: "Geospatial World",
            category: "Around the World",
            subcategory: "Technology"
        },
        {
            title: "GPS Accuracy Improvements Coming with New Satellite Launch",
            summary: "The upcoming launch of new GPS satellites promises to improve location accuracy for everyday users and specialized applications.",
            date: "2025-04-05",
            image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            url: "https://spacenews.com/space-force-reassigns-gps-satellite-launch-from-ula-to-spacex/",
            source: "Navigation News",
            category: "Around the World",
            subcategory: "Navigation"
        },
        {
            title: "Remote Sensing Applications in Climate Change Monitoring",
            summary: "Scientists are using advanced remote sensing techniques to track climate change impacts with unprecedented precision.",
            date: "2025-04-02",
            image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            url: "https://www.nps.gov/articles/000/ncpn_remote-sensing-and-climate-change-at-bryce-canyon-np.htm",
            source: "Earth Observation Magazine",
            category: "Around the World",
            subcategory: "Climate"
        },
        {
            title: "New Open-Source GIS Tools Transforming Humanitarian Response",
            summary: "Humanitarian organizations are leveraging new open-source GIS tools to improve disaster response and aid distribution.",
            date: "2025-04-18",
            image: "https://images.unsplash.com/photo-1527219525722-f9767a7f2884?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80",
            url: "https://reliefweb.int/report/world/unleashing-power-gis-together-ifrc-network-gis-training-platform",
            source: "Humanitarian Tech Review",
            category: "Around the World",
            subcategory: "GIS"
        },
        {
            title: "Drone Mapping Techniques Revolutionize Archaeological Research",
            summary: "Archaeologists are using drone mapping to discover and document ancient sites that were previously inaccessible or unknown.",
            date: "2025-04-12",
            image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            url: "https://advexure.com/blogs/news/archaeological-surveying-drones-uncovering-the-past",
            source: "Digital Archaeology Journal",
            category: "Around the World",
            subcategory: "Remote Sensing"
        },
        {
            title: "Nepal Launches First Geospatial Data Portal for Public Access",
            summary: "The Government of Nepal has launched a comprehensive geospatial data portal that provides public access to various spatial datasets.",
            date: "2025-04-17",
            image: "https://images.unsplash.com/photo-1544461772-722f2a1a21f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            url: "https://myrepublica.nagariknetwork.com/news/cbs-launches-ever-first-integrated-data-portal",
            source: "Kathmandu Post",
            category: "In Nepal",
            subcategory: "Government"
        },
        {
            title: "Kathmandu Valley Mapping Project Completes High-Resolution Survey",
            summary: "A collaborative project has completed a high-resolution mapping survey of the Kathmandu Valley, providing valuable data for urban planning and disaster management.",
            date: "2025-04-12",
            image: "https://images.unsplash.com/photo-1558799401-7c3f139af685?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            url: "https://flyinglabs.org/blog/high-resolution-aerial-mapping-of-nepals-urban-centers-aids-urban-planning-during-covid-19",
            source: "Nepal Times",
            category: "In Nepal",
            subcategory: "Urban Planning"
        },
        {
            title: "Nepali Researchers Develop Low-Cost Drone for Agricultural Monitoring",
            summary: "A team of researchers from Tribhuvan University has developed a low-cost drone system specifically designed for agricultural monitoring in Nepal's diverse terrain.",
            date: "2025-04-08",
            image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            url: "https://www.researchgate.net/publication/380937964_DATAVEILLANCE_MANAGING_USING_MICRO_DRONE_TECHNOLOGY_FOR_AGRICULTURE_PURPOSE_IN_NEPAL",
            source: "TechLekh",
            category: "In Nepal",
            subcategory: "Innovation"
        },
        {
            title: "Nepal's First Digital Cadastre System Launched in Pilot Districts",
            summary: "The Department of Land Management has launched Nepal's first digital cadastre system in selected pilot districts, aiming to modernize land records management.",
            date: "2025-04-03",
            image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1396&q=80",
            url: "https://www.gim-international.com/content/news/rmsi-develops-land-record-information-management-system-for-nepal",
            source: "Himalayan Times",
            category: "In Nepal",
            subcategory: "Land Management"
        },
        {
            title: "Nepal Implements GIS-Based Disaster Risk Reduction System",
            summary: "Nepal has implemented a new GIS-based system for disaster risk reduction, helping communities prepare for and respond to natural disasters.",
            date: "2025-04-14",
            image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
            url: "https://www.undrr.org/news/successful-localization-disaster-risk-reduction-efforts-nepal-supported-through-well",
            source: "Nepal Disaster Review",
            category: "In Nepal",
            subcategory: "Disaster Management"
        },
        {
            title: "Nepali Startup Develops Mobile App for Precision Farming",
            summary: "A Nepali startup has developed a mobile application that uses satellite data to provide precision farming recommendations to small-scale farmers.",
            date: "2025-04-10",
            image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            url: "https://www.researchgate.net/publication/388398904_KRISHIDRISHTI_TRANSFORMING_NEPALESE_FARMING_INTO_PRECISION_AGRICULTURE_WITH_SATELLITE_AND_DIGITAL_TECHNOLOGY",
            source: "AgriTech Nepal",
            category: "In Nepal",
            subcategory: "Agriculture"
        },
        {
            title: "Machine Learning Models Improve Flood Prediction Accuracy",
            summary: "Researchers have developed new machine learning models that significantly improve the accuracy of flood predictions using geospatial data.",
            date: "2025-04-18",
            image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            url: "https://link.springer.com/article/10.1007/s11356-024-34286-7",
            source: "AI in Geoscience",
            category: "What's Buzzing",
            subcategory: "AI Research"
        },
        {
            title: "AI-Powered Image Recognition for Automated Map Updates",
            summary: "New AI systems can automatically detect and categorize changes in satellite imagery, enabling faster and more accurate map updates.",
            date: "2025-04-12",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80",
            url: "https://www.4earthintelligence.com/insights/ai-powered-satellite-imagery-analytics/",
            source: "Tech Innovations",
            category: "What's Buzzing",
            subcategory: "AI Technology"
        },
        {
            title: "Neural Networks Revolutionize Land Cover Classification",
            summary: "Deep learning neural networks are achieving unprecedented accuracy in classifying land cover from satellite imagery.",
            date: "2025-04-08",
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1365&q=80",
            url: "https://github.com/aokdata/Land_Cover_Classification",
            source: "AI Research Journal",
            category: "What's Buzzing",
            subcategory: "Deep Learning"
        },
        {
            title: "Blockchain Applications in Land Registry Systems",
            summary: "Several countries are piloting blockchain-based land registry systems to improve transparency and reduce fraud.",
            date: "2025-04-14",
            image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
            url: "https://www.antiersolutions.com/blogs/blockchain-for-land-registry-how-it-works-and-why-it-matters/",
            source: "Digital Governance",
            category: "What's Buzzing",
            subcategory: "Blockchain"
        },
        {
            title: "Quantum Computing Applications in Geospatial Analysis",
            summary: "Researchers are exploring how quantum computing could revolutionize complex geospatial analyses that are currently computationally intensive.",
            date: "2025-04-16",
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            url: "https://ucalgary.scholaris.ca/items/ea5c942c-d22c-4319-8768-316b2e6f4d42",
            source: "Quantum Computing Today",
            category: "What's Buzzing",
            subcategory: "Quantum Computing"
        },
        {
            title: "Augmented Reality Transforms Field Data Collection",
            summary: "New augmented reality tools are making field data collection more efficient and accurate for geospatial professionals.",
            date: "2025-04-11",
            image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            url: "https://www.periegesis.com/blogs/augmented-reality-AR-and-GIS",
            source: "AR/VR Magazine",
            category: "What's Buzzing",
            subcategory: "Augmented Reality"
        },
        {
            title: "How British Satellite Will Map World's Forests in Carbon Mission",
            summary: "A British-designed satellite named Biomass is set to launch on a five-year mission to map and measure the carbon content of the world's forests, using advanced P-band synthetic aperture radar to generate detailed 3D maps.",
            date: "2025-04-28",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
            url: "https://www.thetimes.co.uk/article/how-british-satellite-will-map-worlds-forests-in-carbon-mission-z8npkttcc",
            source: "The Times",
            category: "Around the World",
            subcategory: "Climate & Forestry"
        },
        {
            title: "Satellite Imagery Startup Albedo Raises $100 Million at $285 Million Valuation",
            summary: "Albedo, a satellite imagery startup, is raising a Series B funding round to develop very low-Earth-orbit satellites capable of capturing ultra-high-resolution imagery, serving industries like agriculture, energy, and defense.",
            date: "2025-04-24",
            image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1344&q=80",
            url: "https://www.businessinsider.com/albedo-satellite-space-funding-round-2025-4",
            source: "Business Insider",
            category: "What's Buzzing",
            subcategory: "Startups & Innovation"
        },
        {
            title: "Satellite Images Reveal How Earth's Surface Moved During Deadly Myanmar Earthquake",
            summary: "Earth-observing satellites have revealed significant ground shifts in central Myanmar following the devastating earthquakes in March, providing valuable data for understanding seismic impacts.",
            date: "2025-04-28",
            image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            url: "https://www.space.com/the-universe/earth/satellite-images-reveal-how-earths-surface-moved-during-deadly-myanmar-earthquake",
            source: "Space.com",
            category: "Around the World",
            subcategory: "Natural Disasters"
        },
        {
            title: "Develop Geospatial Technology Roadmap, Departments Urged",
            summary: "Government departments in Bengaluru are being urged to develop a geospatial technology roadmap to enhance planning and decision-making processes.",
            date: "2025-04-28",
            image: "https://images.unsplash.com/photo-1544461772-722f2a1a21f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
            url: "https://timesofindia.indiatimes.com/city/bengaluru/develop-geospatial-technology-roadmap-departments-urged/articleshow/120705225.cms",
            source: "Times of India",
            category: "Around the World",
            subcategory: "Policy & Governance"
        },
        {
            title: "Geospatial World Excellence Awards 2025 Celebrate Global Achievements",
            summary: "The Geospatial World Excellence Awards 2025 recognized global achievements in technology, application, and policy innovation within the geospatial industry.",
            date: "2025-04-26",
            image: "",
            url: "https://geospatialworld.net/news/press-release/geospatial-world-excellence-awards-2025-celebrate-global-achievements-in-technology-application-policy-innovation/",
            source: "Geospatial World",
            category: "What's Buzzing",
            subcategory: "Events & Recognition"
        },
        {
            title: "Top 10 Trends in GIS Technology for 2025",
            summary: "LightBox outlines the top 10 trends in GIS technology for 2025, including AI-driven geospatial analysis, integration of IoT with GIS, and advancements in 3D GIS and digital twins.",
            date: "2025-02-04",
            image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            url: "https://www.lightboxre.com/insight/top-10-trends-in-gis-technology-for-2025/",
            source: "LightBox",
            category: "What's Buzzing",
            subcategory: "Tech Trends"
        },
        {
            title: "The Future of Geospatial AI is Here – And It's Just Getting Started",
            summary: "AI is transforming geospatial technology, making data processing faster and more actionable across industries like urban planning and disaster response.",
            date: "2025-02-20",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
            url: "https://taylorgeospatial.org/the-future-of-geospatial-ai-is-here-and-its-just-getting-started/",
            source: "Taylor Geospatial Institute",
            category: "What's Buzzing",
            subcategory: "Artificial Intelligence"
        },
        {
            title: "The Future of Geospatial Technology: Key Trends to Watch in 2025",
            summary: "AI and machine learning are revolutionizing geospatial technology, enabling faster and more accurate data analysis for applications like land use detection and natural disaster prediction.",
            date: "2025-03-15",
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1365&q=80",
            url: "https://svencarto.com/the-future-of-geospatial-technology-key-trends-to-watch-in-2025/",
            source: "Sven Carto",
            category: "What's Buzzing",
            subcategory: "Geospatial Technology"
        }
    ];
}

// In a production environment, this would be replaced with actual API calls:
/*
function fetchNewsArticles() {
    // Example API endpoints for different categories
    const apiEndpoints = {
        'Around the World': 'https://api.example.com/news?category=global',
        'In Nepal': 'https://api.example.com/news?category=nepal',
        'What\'s Buzzing': 'https://api.example.com/news?category=trending'
    };
    
    // Fetch all categories
    const fetchPromises = Object.entries(apiEndpoints).map(([category, endpoint]) => {
        return fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                // Map API response to our article format
                return data.articles.map(article => ({
                    title: article.title,
                    summary: article.description,
                    date: article.publishedAt,
                    image: article.urlToImage || 'images/news-fallback.jpg',
                    url: article.url,
                    source: article.source.name,
                    category: category,
                    subcategory: article.category || 'News'
                }));
            });
    });
    
    // Combine all results
    Promise.all(fetchPromises)
        .then(categoryArticles => {
            // Flatten array of arrays
            const allArticles = categoryArticles.flat();
            
            // Sort by date (newest first)
            allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Display articles
            displayNewsArticles(allArticles);
            
            // Store articles for refresh
            window.cachedArticles = allArticles;
            
            // Update last updated time
            updateLastUpdatedTime();
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            const newsFeed = document.getElementById('news-feed');
            if (newsFeed) {
                newsFeed.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Error loading news. Please try again later.</div>';
            }
            
            // Show error notification
            showNotification('error', 'Error Loading News', 'There was a problem loading the latest news. Please try again later.');
        });
}
*/
