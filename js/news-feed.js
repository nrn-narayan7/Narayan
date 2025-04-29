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
        },




            {
                title: "Hyperspectral Imaging Enhances Precision Agriculture in Australia",
                summary: "Australian farmers are adopting hyperspectral imaging to monitor crop health with unprecedented detail, improving yield predictions and reducing resource waste.",
                date: "2025-04-27",
                image: "https://images.unsplash.com/photo-1500595046743-ee5a6a800b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.agriculture.gov.au/research/hyperspectral-imaging-agriculture",
                source: "Australian Agriculture Journal",
                category: "Around the World",
                subcategory: "Agriculture"
            },
            {
                title: "AI-Driven Geospatial Analysis for Urban Heat Island Mitigation",
                summary: "Researchers in Japan are using AI to analyze satellite imagery and mitigate urban heat islands by optimizing green space placement in cities.",
                date: "2025-04-25",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                url: "https://www.jst.go.jp/urban-heat-island-ai-geospatial",
                source: "Japan Science and Technology Agency",
                category: "What's Buzzing",
                subcategory: "AI Technology"
            },
            {
                title: "Brazil Deploys Satellite Monitoring to Combat Illegal Mining",
                summary: "Brazil's government has launched a satellite-based monitoring system to detect and curb illegal mining activities in the Amazon rainforest.",
                date: "2025-04-22",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.inpe.br/amazon-monitoring-satellites",
                source: "Brazil National Institute for Space Research",
                category: "Around the World",
                subcategory: "Environment"
            },
            {
                title: "GIS-Based Coastal Erosion Mapping in the Maldives",
                summary: "A new GIS project in the Maldives maps coastal erosion to inform adaptive infrastructure planning against rising sea levels.",
                date: "2025-04-20",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                url: "https://www.maldives.gov.mv/coastal-erosion-gis",
                source: "Maldives Environmental Review",
                category: "Around the World",
                subcategory: "Climate"
            },
            {
                title: "Drones and LiDAR Transform Wildlife Conservation in Kenya",
                summary: "Kenyan conservationists are using drones equipped with LiDAR to map wildlife habitats and combat poaching in national parks.",
                date: "2025-04-18",
                image: "https://images.unsplash.com/photo-1513836279019-0b0e4d7b2086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.kws.go.ke/drones-lidar-conservation",
                source: "Kenya Wildlife Service",
                category: "Around the World",
                subcategory: "Remote Sensing"
            },
            {
                title: "Nepal's Forest Cover Monitoring Using Sentinel-2 Data",
                summary: "Nepal's forestry department is leveraging Sentinel-2 satellite data to monitor forest cover changes and support conservation efforts.",
                date: "2025-04-15",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.dfrs.gov.np/sentinel-2-forest-monitoring",
                source: "Nepal Forestry Department",
                category: "In Nepal",
                subcategory: "Environment"
            },
            {
                title: "Smart City Planning in Dubai with 3D GIS Modeling",
                summary: "Dubai is implementing 3D GIS modeling to enhance smart city planning, optimizing infrastructure and traffic management.",
                date: "2025-04-14",
                image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.dsc.gov.ae/3d-gis-smart-city",
                source: "Dubai Statistics Center",
                category: "Around the World",
                subcategory: "Urban Planning"
            },
            {
                title: "India's National Earthquake Monitoring System Upgraded with GIS",
                summary: "India has upgraded its earthquake monitoring system with GIS to improve real-time seismic data analysis and disaster response.",
                date: "2025-04-12",
                image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
                url: "https://www.ndma.gov.in/earthquake-gis-upgrade",
                source: "India National Disaster Management Authority",
                category: "Around the World",
                subcategory: "Disaster Management"
            },
            {
                title: "Satellite-Based Ocean Plastic Detection in the Pacific",
                summary: "A new initiative uses satellite imagery to detect and track ocean plastic pollution in the Pacific, aiding cleanup efforts.",
                date: "2025-04-10",
                image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.oceancleanup.com/satellite-plastic-detection",
                source: "Ocean Cleanup Initiative",
                category: "Around the World",
                subcategory: "Environment"
            },
            {
                title: "Nepali Startup Integrates IoT with GIS for Smart Agriculture",
                summary: "A Nepali startup has developed an IoT-GIS platform to provide real-time soil and weather data to farmers, enhancing productivity.",
                date: "2025-04-09",
                image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.techlekh.com/iot-gis-agriculture-nepal",
                source: "TechLekh",
                category: "In Nepal",
                subcategory: "Agriculture"
            },
            {
                title: "Machine Learning Optimizes Renewable Energy Site Selection",
                summary: "Machine learning models are being used to analyze geospatial data for optimal placement of solar and wind farms globally.",
                date: "2025-04-08",
                image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                url: "https://www.renewableenergyworld.com/ml-site-selection",
                source: "Renewable Energy World",
                category: "What's Buzzing",
                subcategory: "AI Research"
            },
            {
                title: "South Africa Uses GIS to Map Water Scarcity Zones",
                summary: "South Africa has implemented a GIS-based system to map water scarcity zones, aiding equitable resource distribution.",
                date: "2025-04-07",
                image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                url: "https://www.dws.gov.za/gis-water-scarcity",
                source: "South Africa Department of Water and Sanitation",
                category: "Around the World",
                subcategory: "Water Management"
            },
            {
                title: "Augmented Reality for Real-Time Geospatial Data Visualization",
                summary: "New AR tools allow geospatial professionals to visualize GIS data in real-time during field surveys, improving accuracy.",
                date: "2025-04-06",
                image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.arvrtech.com/ar-geospatial-visualization",
                source: "AR/VR Technology Review",
                category: "What's Buzzing",
                subcategory: "Augmented Reality"
            },
            {
                title: "Nepal Enhances Flood Prediction with AI and Satellite Data",
                summary: "Nepal's meteorology department is using AI and satellite data to improve flood prediction models for vulnerable regions.",
                date: "2025-04-05",
                image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.dhm.gov.np/ai-flood-prediction",
                source: "Nepal Department of Hydrology and Meteorology",
                category: "In Nepal",
                subcategory: "Disaster Management"
            },
            {
                title: "Canada's Arctic Monitoring with Synthetic Aperture Radar",
                summary: "Canada is using SAR satellites to monitor Arctic ice melt and shipping routes, supporting climate research and navigation.",
                date: "2025-04-04",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.asc-csa.gc.ca/arctic-sar-monitoring",
                source: "Canadian Space Agency",
                category: "Around the World",
                subcategory: "Climate"
            },
            {
                title: "Blockchain Secures Geospatial Data Sharing in Europe",
                summary: "European agencies are piloting blockchain to ensure secure and transparent sharing of geospatial data across borders.",
                date: "2025-04-03",
                image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                url: "https://www.eurogeographics.org/blockchain-geospatial",
                source: "EuroGeographics",
                category: "What's Buzzing",
                subcategory: "Blockchain"
            },
            {
                title: "Vietnam's Rice Yield Forecasting with Remote Sensing",
                summary: "Vietnam is using remote sensing to forecast rice yields, helping farmers and policymakers plan for food security.",
                date: "2025-04-02",
                image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.mard.gov.vn/remote-sensing-rice",
                source: "Vietnam Ministry of Agriculture",
                category: "Around the World",
                subcategory: "Agriculture"
            },
            {
                title: "Nepal's Urban Traffic Management with GIS Analytics",
                summary: "Kathmandu is implementing GIS analytics to optimize traffic flow and reduce congestion in urban areas.",
                date: "2025-04-01",
                image: "https://images.unsplash.com/photo-1558799401-7c3f139af685?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.ktm.gov.np/gis-traffic-management",
                source: "Kathmandu Metropolitan City",
                category: "In Nepal",
                subcategory: "Urban Planning"
            },
            {
                title: "Quantum GIS Algorithms for Faster Spatial Analysis",
                summary: "Researchers are developing quantum computing algorithms to accelerate GIS-based spatial analysis for large datasets.",
                date: "2025-03-31",
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.quantumgis.org/quantum-algorithms",
                source: "Quantum GIS Journal",
                category: "What's Buzzing",
                subcategory: "Quantum Computing"
            },
            {
                title: "Chile's Volcanic Activity Monitored with Satellite Imagery",
                summary: "Chile is using satellite imagery to monitor volcanic activity, improving early warning systems for eruptions.",
                date: "2025-03-30",
                image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
                url: "https://www.sernageomin.cl/volcanic-satellite-monitoring",
                source: "Chile National Geology and Mining Service",
                category: "Around the World",
                subcategory: "Natural Disasters"
            },
            {
                title: "AI-Powered Landslide Risk Mapping in the Philippines",
                summary: "The Philippines is using AI to analyze geospatial data for landslide risk mapping, enhancing disaster preparedness.",
                date: "2025-03-29",
                image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
                url: "https://www.phivolcs.dost.gov.ph/ai-landslide-mapping",
                source: "Philippine Institute of Volcanology and Seismology",
                category: "Around the World",
                subcategory: "Disaster Management"
            },
            {
                title: "Nepal's Glacier Monitoring with High-Resolution Satellites",
                summary: "Nepal is using high-resolution satellite imagery to monitor glacier retreat in the Himalayas, aiding climate research.",
                date: "2025-03-28",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.icimod.org/glacier-monitoring-nepal",
                source: "ICIMOD",
                category: "In Nepal",
                subcategory: "Climate"
            },
            {
                title: "Mexico's Deforestation Tracking with Machine Learning",
                summary: "Mexico is employing machine learning to track deforestation patterns using satellite imagery, supporting conservation policies.",
                date: "2025-03-27",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.conabio.gob.mx/ml-deforestation",
                source: "Mexico National Biodiversity Commission",
                category: "Around the World",
                subcategory: "Environment"
            },
            {
                title: "IoT and GIS Integration for Smart Waste Management in Singapore",
                summary: "Singapore is integrating IoT sensors with GIS to optimize waste collection routes, reducing costs and emissions.",
                date: "2025-03-26",
                image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.nea.gov.sg/iot-gis-waste-management",
                source: "Singapore National Environment Agency",
                category: "Around the World",
                subcategory: "Urban Planning"
            },
            {
                title: "Deep Learning for Coral Reef Health Monitoring",
                summary: "Deep learning models are analyzing satellite imagery to monitor coral reef health, aiding global conservation efforts.",
                date: "2025-03-25",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                url: "https://www.coralguardian.org/dl-coral-monitoring",
                source: "Coral Guardian",
                category: "What's Buzzing",
                subcategory: "Deep Learning"
            },
            {
                title: "Nepal's Land Use Planning with Open-Source GIS Tools",
                summary: "Nepal is adopting open-source GIS tools to improve land use planning and prevent urban sprawl.",
                date: "2025-03-24",
                image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                url: "https://www.molrm.gov.np/open-source-gis",
                source: "Nepal Ministry of Land Reform",
                category: "In Nepal",
                subcategory: "Land Management"
            },
            {
                title: "Russia's Permafrost Monitoring with Remote Sensing",
                summary: "Russia is using remote sensing to monitor permafrost thaw, informing infrastructure planning in Arctic regions.",
                date: "2025-03-23",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.roscosmos.ru/permafrost-monitoring",
                source: "Roscosmos",
                category: "Around the World",
                subcategory: "Climate"
            },
            {
                title: "GIS-Based Public Health Mapping in Nigeria",
                summary: "Nigeria is using GIS to map disease outbreaks, improving public health response and resource allocation.",
                date: "2025-03-22",
                image: "https://images.unsplash.com/photo-1527219525722-f9767a7f2884?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                url: "https://www.health.gov.ng/gis-public-health",
                source: "Nigeria Ministry of Health",
                category: "Around the World",
                subcategory: "Public Health"
            },
            {
                title: "Satellite Video Analytics for Traffic Monitoring in China",
                summary: "China is using satellite video analytics to monitor urban traffic patterns, improving city planning and congestion management.",
                date: "2025-03-21",
                image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.mot.gov.cn/satellite-traffic-analytics",
                source: "China Ministry of Transport",
                category: "Around the World",
                subcategory: "Urban Planning"
            },
            {
                title: "Nepal's Heritage Site Mapping with Drone Technology",
                summary: "Nepal is using drones to map cultural heritage sites, aiding preservation and tourism planning.",
                date: "2025-03-20",
                image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.doa.gov.np/drone-heritage-mapping",
                source: "Nepal Department of Archaeology",
                category: "In Nepal",
                subcategory: "Remote Sensing"
            },
            {
                title: "AI for Automated Wetland Mapping in the USA",
                summary: "The USA is using AI to automate wetland mapping from satellite imagery, supporting environmental protection efforts.",
                date: "2025-03-19",
                image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.epa.gov/ai-wetland-mapping",
                source: "US Environmental Protection Agency",
                category: "What's Buzzing",
                subcategory: "AI Technology"
            },
            {
                title: "Thailand's Mangrove Restoration with Geospatial Data",
                summary: "Thailand is using geospatial data to plan mangrove restoration projects, enhancing coastal ecosystems.",
                date: "2025-03-18",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                url: "https://www.dnp.go.th/mangrove-geospatial",
                source: "Thailand Department of National Parks",
                category: "Around the World",
                subcategory: "Environment"
            },
            {
                title: "Quantum Sensors for High-Precision Geospatial Mapping",
                summary: "Quantum sensors are being developed to enhance the precision of geospatial mapping for navigation and surveying.",
                date: "2025-03-17",
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.quantumtech.com/quantum-sensors-mapping",
                source: "Quantum Technology Review",
                category: "What's Buzzing",
                subcategory: "Quantum Computing"
            },
            {
                title: "Nepal's Renewable Energy Mapping with GIS",
                summary: "Nepal is using GIS to map potential sites for renewable energy projects, supporting sustainable development.",
                date: "2025-03-16",
                image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                url: "https://www.aecc.gov.np/gis-renewable-energy",
                source: "Nepal Alternative Energy Centre",
                category: "In Nepal",
                subcategory: "Energy"
            },
            {
                title: "Argentina's Drought Monitoring with Satellite Data",
                summary: "Argentina is using satellite data to monitor drought conditions, aiding farmers and water management authorities.",
                date: "2025-03-15",
                image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                url: "https://www.inta.gob.ar/drought-satellite-monitoring",
                source: "Argentina National Agricultural Technology Institute",
                category: "Around the World",
                subcategory: "Agriculture"
            },
            {
                title: "GIS for Refugee Camp Planning in Jordan",
                summary: "Jordan is using GIS to plan and manage refugee camps, optimizing resource allocation and infrastructure.",
                date: "2025-03-14",
                image: "https://images.unsplash.com/photo-1527219525722-f9767a7f2884?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                url: "https://www.unhcr.org/jordan-gis-refugee-camps",
                source: "UNHCR Jordan",
                category: "Around the World",
                subcategory: "Humanitarian"
            },
            {
                title: "Machine Learning for Soil Moisture Mapping in Ethiopia",
                summary: "Ethiopia is using machine learning to map soil moisture from satellite data, supporting agricultural planning.",
                date: "2025-03-13",
                image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.moag.gov.et/ml-soil-moisture",
                source: "Ethiopia Ministry of Agriculture",
                category: "Around the World",
                subcategory: "Agriculture"
            },
            {
                title: "Nepal's Air Quality Monitoring with Satellite Sensors",
                summary: "Nepal is using satellite sensors to monitor air quality in urban areas, informing public health policies.",
                date: "2025-03-12",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                url: "https://www.moe.gov.np/satellite-air-quality",
                source: "Nepal Ministry of Environment",
                category: "In Nepal",
                subcategory: "Public Health"
            },
            {
                title: "AI for Real-Time Wildfire Detection in Australia",
                summary: "Australia is deploying AI to analyze satellite imagery for real-time wildfire detection, improving response times.",
                date: "2025-03-11",
                image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.csiro.au/ai-wildfire-detection",
                source: "CSIRO",
                category: "What's Buzzing",
                subcategory: "AI Technology"
            },
            {
                title: "Indonesia's Peatland Fire Monitoring with Remote Sensing",
                summary: "Indonesia is using remote sensing to monitor peatland fires, reducing environmental and health impacts.",
                date: "2025-03-10",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.brg.go.id/peatland-fire-monitoring",
                source: "Indonesia Peatland Restoration Agency",
                category: "Around the World",
                subcategory: "Environment"
            },
            {
                title: "Blockchain for Geospatial Data Provenance in Canada",
                summary: "Canada is exploring blockchain to ensure the provenance and integrity of geospatial data in public databases.",
                date: "2025-03-09",
                image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                url: "https://www.nrcan.gc.ca/blockchain-geospatial",
                source: "Natural Resources Canada",
                category: "What's Buzzing",
                subcategory: "Blockchain"
            },
            {
                title: "Nepal's Water Resource Mapping with GIS",
                summary: "Nepal is using GIS to map water resources, supporting irrigation and hydropower development.",
                date: "2025-03-08",
                image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                url: "https://www.dwri.gov.np/gis-water-resources",
                source: "Nepal Department of Water Resources",
                category: "In Nepal",
                subcategory: "Water Management"
            },
            {
                title: "Satellite-Based Crop Insurance in India",
                summary: "India is using satellite imagery to develop crop insurance models, ensuring fair payouts for farmers.",
                date: "2025-03-07",
                image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.irdai.gov.in/satellite-crop-insurance",
                source: "Insurance Regulatory Authority of India",
                category: "Around the World",
                subcategory: "Agriculture"
            },
            {
                title: "GIS for Urban Resilience Planning in Bangladesh",
                summary: "Bangladesh is using GIS to plan urban resilience against floods and cyclones, protecting coastal cities.",
                date: "2025-03-06",
                image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.lged.gov.bd/gis-urban-resilience",
                source: "Bangladesh Local Government Engineering Department",
                category: "Around the World",
                subcategory: "Urban Planning"
            },
            {
                title: "Deep Learning for Glacier Mass Balance in Greenland",
                summary: "Deep learning is being used to estimate glacier mass balance in Greenland from satellite data, aiding climate models.",
                date: "2025-03-05",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                url: "https://www.geus.dk/dl-glacier-mass",
                source: "Geological Survey of Denmark and Greenland",
                category: "What's Buzzing",
                subcategory: "Deep Learning"
            },
            {
                title: "Nepal's Biodiversity Mapping with Remote Sensing",
                summary: "Nepal is using remote sensing to map biodiversity hotspots, supporting conservation and ecotourism.",
                date: "2025-03-04",
                image: "https://images.unsplash.com/photo-1513836279019-0b0e4d7b2086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.dnpwc.gov.np/biodiversity-remote-sensing",
                source: "Nepal Department of National Parks",
                category: "In Nepal",
                subcategory: "Environment"
            },
            {
                title: "AI for Urban Growth Prediction in South Korea",
                summary: "South Korea is using AI to predict urban growth patterns from geospatial data, guiding sustainable development.",
                date: "2025-03-03",
                image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.molit.go.kr/ai-urban-growth",
                source: "South Korea Ministry of Land",
                category: "What's Buzzing",
                subcategory: "AI Technology"
            },
            {
                title: "Satellite Monitoring of Air Pollution in Pakistan",
                summary: "Pakistan is using satellite data to monitor air pollution levels, informing public health and environmental policies.",
                date: "2025-03-02",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                url: "https://www.epd.gov.pk/satellite-air-pollution",
                source: "Pakistan Environmental Protection Agency",
                category: "Around the World",
                subcategory: "Public Health"
            },
            {
                title: "GIS for Mining Exploration in Mongolia",
                summary: "Mongolia is using GIS to map mineral deposits, streamlining mining exploration and reducing environmental impacts.",
                date: "2025-03-01",
                image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                url: "https://www.mram.gov.mn/gis-mining-exploration",
                source: "Mongolia Mineral Resources Authority",
                category: "Around the World",
                subcategory: "Mining"
            },
            {
                title: "Nepal's Earthquake Risk Mapping with GIS",
                summary: "Nepal is enhancing earthquake risk mapping with GIS to improve urban planning and disaster preparedness.",
                date: "2025-02-28",
                image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
                url: "https://www.nset.org.np/gis-earthquake-risk",
                source: "National Earthquake Monitoring Centre",
                category: "In Nepal",
                subcategory: "Disaster Management"
            },
            {
                title: "Satellite-Based Fisheries Management in Norway",
                summary: "Norway is using satellite imagery to monitor fish stocks, supporting sustainable fisheries management.",
                date: "2025-02-27",
                image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.fiskeridir.no/satellite-fisheries",
                source: "Norway Directorate of Fisheries",
                category: "Around the World",
                subcategory: "Fisheries"
            },
            {
                title: "Augmented Reality for Geospatial Training in Germany",
                summary: "Germany is using AR to train geospatial professionals, enhancing field data collection and analysis skills.",
                date: "2025-02-26",
                image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                url: "https://www.dlr.de/ar-geospatial-training",
                source: "German Aerospace Center",
                category: "What's Buzzing",
                subcategory: "Augmented Reality"
            },

                {
                    title: "AI Enhances Geospatial Mapping of Refugee Movements in Sudan",
                    summary: "Sudan is using AI-driven geospatial analysis to track refugee movements, improving humanitarian aid distribution in conflict zones.",
                    date: "2025-04-29",
                    image: "https://images.unsplash.com/photo-1527219525722-f9767a7f2884?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                    url: "https://www.unhcr.org/sudan-ai-refugee-mapping",
                    source: "UNHCR Sudan",
                    category: "Around the World",
                    subcategory: "Humanitarian"
                },
                {
                    title: "Nepal's Solar Energy Potential Mapped with GIS",
                    summary: "Nepal's energy department is using GIS to map solar energy potential, guiding the placement of solar farms in rural areas.",
                    date: "2025-04-28",
                    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                    url: "https://www.aecc.gov.np/gis-solar-energy",
                    source: "Nepal Alternative Energy Centre",
                    category: "In Nepal",
                    subcategory: "Energy"
                },
                {
                    title: "Satellite-Based Monitoring of Coral Bleaching in the Great Barrier Reef",
                    summary: "Australia is using satellite imagery to monitor coral bleaching events in the Great Barrier Reef, aiding conservation strategies.",
                    date: "2025-04-27",
                    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                    url: "https://www.gbrmpa.gov.au/satellite-coral-bleaching",
                    source: "Great Barrier Reef Marine Park Authority",
                    category: "Around the World",
                    subcategory: "Environment"
                },
                {
                    title: "Machine Learning for Urban Flood Risk Assessment in Vietnam",
                    summary: "Vietnam is leveraging machine learning to assess urban flood risks using geospatial data, enhancing city planning.",
                    date: "2025-04-26",
                    image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.moc.gov.vn/ml-urban-flood-risk",
                    source: "Vietnam Ministry of Construction",
                    category: "What's Buzzing",
                    subcategory: "AI Research"
                },
                {
                    title: "Peru's Amazon Deforestation Monitored with Drones",
                    summary: "Peru is deploying drones to monitor deforestation in the Amazon, providing high-resolution data for enforcement actions.",
                    date: "2025-04-25",
                    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                    url: "https://www.minam.gob.pe/drones-amazon-monitoring",
                    source: "Peru Ministry of Environment",
                    category: "Around the World",
                    subcategory: "Remote Sensing"
                },
                {
                    title: "Nepal's Rural Electrification Planning with GIS",
                    summary: "Nepal is using GIS to plan rural electrification projects, ensuring efficient grid expansion to remote areas.",
                    date: "2025-04-24",
                    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                    url: "https://www.nea.org.np/gis-rural-electrification",
                    source: "Nepal Electricity Authority",
                    category: "In Nepal",
                    subcategory: "Energy"
                },
                {
                    title: "Blockchain for Land Tenure Security in Ghana",
                    summary: "Ghana is piloting a blockchain-based system to secure land tenure records, reducing disputes and improving transparency.",
                    date: "2025-04-23",
                    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                    url: "https://www.lands.gov.gh/blockchain-land-tenure",
                    source: "Ghana Ministry of Lands",
                    category: "What's Buzzing",
                    subcategory: "Blockchain"
                },
                {
                    title: "Satellite Imagery for Avalanche Risk Mapping in Switzerland",
                    summary: "Switzerland is using satellite imagery to map avalanche risks in the Alps, improving safety for skiers and residents.",
                    date: "2025-04-22",
                    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                    url: "https://www.slf.ch/satellite-avalanche-mapping",
                    source: "Swiss Institute for Snow and Avalanche Research",
                    category: "Around the World",
                    subcategory: "Natural Disasters"
                },
                {
                    title: "AI-Powered Geospatial Analysis for Smart Grids in Germany",
                    summary: "Germany is using AI to analyze geospatial data for smart grid optimization, enhancing energy distribution efficiency.",
                    date: "2025-04-21",
                    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                    url: "https://www.bmwi.de/ai-smart-grids",
                    source: "German Federal Ministry for Economic Affairs",
                    category: "What's Buzzing",
                    subcategory: "AI Technology"
                },
                {
                    title: "Nepal's Tourism Mapping with Drone Imagery",
                    summary: "Nepal is using drone imagery to map tourist destinations, enhancing promotion and infrastructure planning.",
                    date: "2025-04-20",
                    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.tourism.gov.np/drone-tourism-mapping",
                    source: "Nepal Ministry of Tourism",
                    category: "In Nepal",
                    subcategory: "Remote Sensing"
                },
                {
                    title: "Deep Learning for Desertification Monitoring in Mongolia",
                    summary: "Mongolia is using deep learning to monitor desertification trends from satellite imagery, guiding land restoration efforts.",
                    date: "2025-04-19",
                    image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                    url: "https://www.megdm.gov.mn/dl-desertification",
                    source: "Mongolia Ministry of Environment",
                    category: "What's Buzzing",
                    subcategory: "Deep Learning"
                },
                {
                    title: "Colombia Uses GIS for Biodiversity Conservation Planning",
                    summary: "Colombia is leveraging GIS to plan biodiversity conservation areas, protecting endangered species and ecosystems.",
                    date: "2025-04-18",
                    image: "https://images.unsplash.com/photo-1513836279019-0b0e4d7b2086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.minambiente.gov.co/gis-biodiversity",
                    source: "Colombia Ministry of Environment",
                    category: "Around the World",
                    subcategory: "Environment"
                },
                {
                    title: "Quantum Computing for Geospatial Optimization in Japan",
                    summary: "Japan is exploring quantum computing to optimize geospatial logistics, reducing costs in supply chain management.",
                    date: "2025-04-17",
                    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.meti.go.jp/quantum-geospatial",
                    source: "Japan Ministry of Economy, Trade and Industry",
                    category: "What's Buzzing",
                    subcategory: "Quantum Computing"
                },
                {
                    title: "Nepal's Hydropower Site Mapping with GIS",
                    summary: "Nepal is using GIS to map potential hydropower sites, supporting sustainable energy development in mountainous regions.",
                    date: "2025-04-16",
                    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                    url: "https://www.doe.gov.np/gis-hydropower",
                    source: "Nepal Department of Electricity",
                    category: "In Nepal",
                    subcategory: "Energy"
                },
                {
                    title: "Satellite-Based Crop Monitoring in Argentina",
                    summary: "Argentina is using satellite imagery to monitor crop growth, improving agricultural productivity and forecasting.",
                    date: "2025-04-15",
                    image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.inta.gob.ar/satellite-crop-monitoring",
                    source: "Argentina National Agricultural Technology Institute",
                    category: "Around the World",
                    subcategory: "Agriculture"
                },
                {
                    title: "AI for Real-Time Tsunami Warning Systems in Indonesia",
                    summary: "Indonesia is deploying AI to analyze geospatial data for real-time tsunami warnings, enhancing coastal safety.",
                    date: "2025-04-14",
                    image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.bmkg.go.id/ai-tsunami-warning",
                    source: "Indonesia Meteorological Agency",
                    category: "What's Buzzing",
                    subcategory: "AI Technology"
                },
                {
                    title: "Kenya's Wildlife Migration Tracking with Satellite Tags",
                    summary: "Kenya is using satellite tags to track wildlife migrations, informing conservation and ecotourism strategies.",
                    date: "2025-04-13",
                    image: "https://images.unsplash.com/photo-1513836279019-0b0e4d7b2086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.kws.go.ke/satellite-wildlife-tracking",
                    source: "Kenya Wildlife Service",
                    category: "Around the World",
                    subcategory: "Environment"
                },
                {
                    title: "Nepal's Urban Heat Mapping with Satellite Data",
                    summary: "Nepal is using satellite data to map urban heat islands in Kathmandu, guiding green infrastructure development.",
                    date: "2025-04-12",
                    image: "https://images.unsplash.com/photo-1558799401-7c3f139af685?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                    url: "https://www.ktm.gov.np/satellite-urban-heat",
                    source: "Kathmandu Metropolitan City",
                    category: "In Nepal",
                    subcategory: "Urban Planning"
                },
                {
                    title: "Blockchain for Geospatial Data Integrity in Brazil",
                    summary: "Brazil is implementing blockchain to ensure the integrity of geospatial data used in environmental monitoring.",
                    date: "2025-04-11",
                    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                    url: "https://www.ibama.gov.br/blockchain-geospatial",
                    source: "Brazilian Institute of Environment",
                    category: "What's Buzzing",
                    subcategory: "Blockchain"
                },
                {
                    title: "Satellite Monitoring of Glacial Lakes in Bhutan",
                    summary: "Bhutan is using satellite imagery to monitor glacial lakes, reducing the risk of outburst floods in the Himalayas.",
                    date: "2025-04-10",
                    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                    url: "https://www.ndc.gov.bt/satellite-glacial-lakes",
                    source: "Bhutan National Disaster Management",
                    category: "Around the World",
                    subcategory: "Climate"
                },
                {
                    title: "Deep Learning for Urban Sprawl Analysis in China",
                    summary: "China is using deep learning to analyze urban sprawl from satellite imagery, guiding sustainable city planning.",
                    date: "2025-04-09",
                    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.mohurd.gov.cn/dl-urban-sprawl",
                    source: "China Ministry of Housing and Urban Development",
                    category: "What's Buzzing",
                    subcategory: "Deep Learning"
                },
                {
                    title: "Nepal's Landslide Risk Mapping with Drones",
                    summary: "Nepal is using drones to map landslide risks in hilly regions, improving disaster preparedness and response.",
                    date: "2025-04-08",
                    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.nset.org.np/drone-landslide-mapping",
                    source: "National Earthquake Monitoring Centre",
                    category: "In Nepal",
                    subcategory: "Remote Sensing"
                },
                {
                    title: "GIS for Renewable Energy Planning in Morocco",
                    summary: "Morocco is using GIS to plan renewable energy projects, optimizing solar and wind farm locations.",
                    date: "2025-04-07",
                    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                    url: "https://www.mem.gov.ma/gis-renewable-energy",
                    source: "Morocco Ministry of Energy",
                    category: "Around the World",
                    subcategory: "Energy"
                },
                {
                    title: "AI for Coastal Erosion Monitoring in the UK",
                    summary: "The UK is using AI to monitor coastal erosion from satellite imagery, informing coastal defense strategies.",
                    date: "2025-04-06",
                    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                    url: "https://www.gov.uk/ai-coastal-erosion",
                    source: "UK Environment Agency",
                    category: "What's Buzzing",
                    subcategory: "AI Technology"
                },
                {
                    title: "Satellite-Based Fisheries Monitoring in Chile",
                    summary: "Chile is using satellite imagery to monitor illegal fishing, supporting sustainable fisheries management.",
                    date: "2025-04-05",
                    image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.sernapesca.cl/satellite-fisheries",
                    source: "Chile National Fisheries Service",
                    category: "Around the World",
                    subcategory: "Fisheries"
                },
                {
                    title: "Nepal's Forest Fire Monitoring with Satellite Data",
                    summary: "Nepal is using satellite data to monitor forest fires, improving response times and conservation efforts.",
                    date: "2025-04-04",
                    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                    url: "https://www.dfrs.gov.np/satellite-forest-fire",
                    source: "Nepal Forestry Department",
                    category: "In Nepal",
                    subcategory: "Environment"
                },
                {
                    title: "Quantum GIS for Logistics Optimization in the USA",
                    summary: "The USA is exploring quantum GIS algorithms to optimize logistics and supply chain networks.",
                    date: "2025-04-03",
                    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.usgs.gov/quantum-gis-logistics",
                    source: "US Geological Survey",
                    category: "What's Buzzing",
                    subcategory: "Quantum Computing"
                },
                {
                    title: "GIS for Public Transport Planning in South Africa",
                    summary: "South Africa is using GIS to optimize public transport routes, improving accessibility in urban areas.",
                    date: "2025-04-02",
                    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.transport.gov.za/gis-public-transport",
                    source: "South Africa Department of Transport",
                    category: "Around the World",
                    subcategory: "Urban Planning"
                },
                {
                    title: "AI for Snow Cover Mapping in Canada",
                    summary: "Canada is using AI to map snow cover from satellite imagery, supporting water resource management and climate research.",
                    date: "2025-04-01",
                    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                    url: "https://www.ec.gc.ca/ai-snow-cover",
                    source: "Environment and Climate Change Canada",
                    category: "What's Buzzing",
                    subcategory: "AI Technology"
                },
                {
                    title: "Nepal's Wetland Conservation with GIS",
                    summary: "Nepal is using GIS to map and conserve wetlands, protecting biodiversity and water resources.",
                    date: "2025-03-31",
                    image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.dnpwc.gov.np/gis-wetland-conservation",
                    source: "Nepal Department of National Parks",
                    category: "In Nepal",
                    subcategory: "Environment"
                },
                {
                    title: "Satellite Monitoring of Air Quality in India",
                    summary: "India is using satellite data to monitor air quality, informing policies to combat urban pollution.",
                    date: "2025-03-30",
                    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                    url: "https://www.cpcb.nic.in/satellite-air-quality",
                    source: "Central Pollution Control Board",
                    category: "Around the World",
                    subcategory: "Public Health"
                },
                {
                    title: "Deep Learning for Soil Erosion Mapping in Brazil",
                    summary: "Brazil is using deep learning to map soil erosion from satellite imagery, guiding agricultural sustainability.",
                    date: "2025-03-29",
                    image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.embrapa.br/dl-soil-erosion",
                    source: "Brazilian Agricultural Research Corporation",
                    category: "What's Buzzing",
                    subcategory: "Deep Learning"
                },
                {
                    title: "Blockchain for Geospatial Data Sharing in Australia",
                    summary: "Australia is piloting blockchain to facilitate secure geospatial data sharing among government agencies.",
                    date: "2025-03-28",
                    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                    url: "https://www.ga.gov.au/blockchain-geospatial",
                    source: "Geoscience Australia",
                    category: "What's Buzzing",
                    subcategory: "Blockchain"
                },
                {
                    title: "Nepal's Public Health Mapping with GIS",
                    summary: "Nepal is using GIS to map disease outbreaks, improving public health response and resource allocation.",
                    date: "2025-03-27",
                    image: "https://images.unsplash.com/photo-1527219525722-f9767a7f2884?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                    url: "https://www.mohp.gov.np/gis-public-health",
                    source: "Nepal Ministry of Health",
                    category: "In Nepal",
                    subcategory: "Public Health"
                },
                {
                    title: "Satellite-Based Drought Monitoring in Ethiopia",
                    summary: "Ethiopia is using satellite imagery to monitor drought conditions, aiding agricultural planning and food security.",
                    date: "2025-03-26",
                    image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                    url: "https://www.moag.gov.et/satellite-drought",
                    source: "Ethiopia Ministry of Agriculture",
                    category: "Around the World",
                    subcategory: "Agriculture"
                },
                {
                    title: "AI for Urban Green Space Planning in Singapore",
                    summary: "Singapore is using AI to plan urban green spaces, enhancing livability and sustainability.",
                    date: "2025-03-25",
                    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.nparks.gov.sg/ai-green-space",
                    source: "Singapore National Parks Board",
                    category: "What's Buzzing",
                    subcategory: "AI Technology"
                },
                {
                    title: "GIS for Disaster Recovery Planning in the Philippines",
                    summary: "The Philippines is using GIS to plan disaster recovery, optimizing reconstruction efforts after typhoons.",
                    date: "2025-03-24",
                    image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.ndrrmc.gov.ph/gis-disaster-recovery",
                    source: "Philippines National Disaster Risk Reduction",
                    category: "Around the World",
                    subcategory: "Disaster Management"
                },
                {
                    title: "Nepal's Irrigation Mapping with Satellite Data",
                    summary: "Nepal is using satellite data to map irrigation systems, improving water management for agriculture.",
                    date: "2025-03-23",
                    image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.doi.gov.np/satellite-irrigation",
                    source: "Nepal Department of Irrigation",
                    category: "In Nepal",
                    subcategory: "Agriculture"
                },
                {
                    title: "Satellite Monitoring of Volcanic Ash Clouds in Iceland",
                    summary: "Iceland is using satellite imagery to monitor volcanic ash clouds, ensuring aviation safety.",
                    date: "2025-03-22",
                    image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
                    url: "https://www.vedur.is/satellite-volcanic-ash",
                    source: "Icelandic Meteorological Office",
                    category: "Around the World",
                    subcategory: "Natural Disasters"
                },
                {
                    title: "Quantum Sensors for Geospatial Surveying in France",
                    summary: "France is developing quantum sensors to enhance the accuracy of geospatial surveying for infrastructure projects.",
                    date: "2025-03-21",
                    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.ign.fr/quantum-sensors-surveying",
                    source: "French National Geographic Institute",
                    category: "What's Buzzing",
                    subcategory: "Quantum Computing"
                },
                {
                    title: "GIS for Coastal Management in Thailand",
                    summary: "Thailand is using GIS to manage coastal resources, protecting ecosystems and supporting tourism.",
                    date: "2025-03-20",
                    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                    url: "https://www.dmr.go.th/gis-coastal-management",
                    source: "Thailand Department of Marine Resources",
                    category: "Around the World",
                    subcategory: "Environment"
                },
                {
                    title: "Nepal's Ecotourism Planning with GIS",
                    summary: "Nepal is using GIS to plan ecotourism routes, balancing conservation and economic development.",
                    date: "2025-03-19",
                    image: "https://images.unsplash.com/photo-1513836279019-0b0e4d7b2086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.tourism.gov.np/gis-ecotourism",
                    source: "Nepal Ministry of Tourism",
                    category: "In Nepal",
                    subcategory: "Environment"
                },
                {
                    title: "AI for Traffic Congestion Prediction in South Korea",
                    summary: "South Korea is using AI to predict traffic congestion from geospatial data, improving urban mobility.",
                    date: "2025-03-18",
                    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.molit.go.kr/ai-traffic-congestion",
                    source: "South Korea Ministry of Land",
                    category: "What's Buzzing",
                    subcategory: "AI Technology"
                },
                {
                    title: "Satellite-Based Mangrove Mapping in Malaysia",
                    summary: "Malaysia is using satellite imagery to map mangrove forests, supporting conservation and climate resilience.",
                    date: "2025-03-17",
                    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                    url: "https://www.forestry.gov.my/satellite-mangrove",
                    source: "Malaysia Forestry Department",
                    category: "Around the World",
                    subcategory: "Environment"
                },
                {
                    title: "Deep Learning for Land Use Change Detection in Mexico",
                    summary: "Mexico is using deep learning to detect land use changes from satellite imagery, guiding urban planning.",
                    date: "2025-03-16",
                    image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                    url: "https://www.inegi.org.mx/dl-land-use",
                    source: "Mexico National Institute of Statistics",
                    category: "What's Buzzing",
                    subcategory: "Deep Learning"
                },
                {
                    title: "Nepal's Avalanche Risk Mapping with Satellite Data",
                    summary: "Nepal is using satellite data to map avalanche risks in the Himalayas, improving safety for trekkers and locals.",
                    date: "2025-03-15",
                    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                    url: "https://www.dhm.gov.np/satellite-avalanche",
                    source: "Nepal Department of Hydrology and Meteorology",
                    category: "In Nepal",
                    subcategory: "Natural Disasters"
                },
                {
                    title: "GIS for Smart Agriculture in Nigeria",
                    summary: "Nigeria is using GIS to optimize agricultural practices, improving food security and farmer incomes.",
                    date: "2025-03-14",
                    image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.fmard.gov.ng/gis-smart-agriculture",
                    source: "Nigeria Ministry of Agriculture",
                    category: "Around the World",
                    subcategory: "Agriculture"
                },
                {
                    title: "Blockchain for Geospatial Data Privacy in the Netherlands",
                    summary: "The Netherlands is using blockchain to ensure privacy in geospatial data sharing for urban planning.",
                    date: "2025-03-13",
                    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                    url: "https://www.kadaster.nl/blockchain-geospatial",
                    source: "Netherlands Cadastre",
                    category: "What's Buzzing",
                    subcategory: "Blockchain"
                },
                {
                    title: "Satellite Monitoring of River Pollution in Pakistan",
                    summary: "Pakistan is using satellite imagery to monitor river pollution, supporting water quality management.",
                    date: "2025-03-12",
                    image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                    url: "https://www.epd.gov.pk/satellite-river-pollution",
                    source: "Pakistan Environmental Protection Agency",
                    category: "Around the World",
                    subcategory: "Water Management"
                },
                {
                    title: "Nepal's Smart City Planning with GIS",
                    summary: "Nepal is using GIS to plan smart cities, optimizing infrastructure and services in urban areas.",
                    date: "2025-03-11",
                    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                    url: "https://www.moud.gov.np/gis-smart-city",
                    source: "Nepal Ministry of Urban Development",
                    category: "In Nepal",
                    subcategory: "Urban Planning"
                },
                {
                    title: "AI for Earthquake Prediction in Turkey",
                    summary: "Turkey is using AI to analyze geospatial data for earthquake prediction, improving early warning systems.",
                    date: "2025-03-10",
                    image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
                    url: "https://www.afad.gov.tr/ai-earthquake-prediction",
                    source: "Turkey Disaster and Emergency Management Authority",
                    category: "What's Buzzing",
                    subcategory: "AI Technology"
                },






            
                    {
                        title: "AI for Precision Forestry Management in Finland",
                        summary: "Finland is using AI to analyze satellite imagery for precision forestry, optimizing timber harvests and conservation efforts.",
                        date: "2025-04-30",
                        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                        url: "https://www.mmm.fi/ai-precision-forestry",
                        source: "Finland Ministry of Agriculture and Forestry",
                        category: "Around the World",
                        subcategory: "Environment"
                    },
                    {
                        title: "Nepal's Wildlife Corridor Mapping with GIS",
                        summary: "Nepal is using GIS to map wildlife corridors, supporting biodiversity conservation and reducing human-wildlife conflict.",
                        date: "2025-04-29",
                        image: "https://images.unsplash.com/photo-1513836279019-0b0e4d7b2086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.dnpwc.gov.np/gis-wildlife-corridor",
                        source: "Nepal Department of National Parks",
                        category: "In Nepal",
                        subcategory: "Environment"
                    },
                    {
                        title: "Satellite-Based Flood Monitoring in Bangladesh",
                        summary: "Bangladesh is using satellite imagery to monitor flood extents in real-time, improving disaster response and recovery.",
                        date: "2025-04-28",
                        image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.bwdb.gov.bd/satellite-flood-monitoring",
                        source: "Bangladesh Water Development Board",
                        category: "Around the World",
                        subcategory: "Disaster Management"
                    },
                    {
                        title: "Deep Learning for Crop Disease Detection in India",
                        summary: "India is using deep learning to detect crop diseases from satellite imagery, enhancing agricultural productivity.",
                        date: "2025-04-27",
                        image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.icar.gov.in/dl-crop-disease",
                        source: "Indian Council of Agricultural Research",
                        category: "What's Buzzing",
                        subcategory: "Deep Learning"
                    },
                    {
                        title: "Drones for Coastal Mapping in New Zealand",
                        summary: "New Zealand is deploying drones to map coastal ecosystems, supporting conservation and climate adaptation.",
                        date: "2025-04-26",
                        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                        url: "https://www.doc.govt.nz/drones-coastal-mapping",
                        source: "New Zealand Department of Conservation",
                        category: "Around the World",
                        subcategory: "Remote Sensing"
                    },
                    {
                        title: "Nepal's Rural Road Mapping with GIS",
                        summary: "Nepal is using GIS to map rural road networks, improving access to remote communities and markets.",
                        date: "2025-04-25",
                        image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                        url: "https://www.dor.gov.np/gis-rural-roads",
                        source: "Nepal Department of Roads",
                        category: "In Nepal",
                        subcategory: "Infrastructure"
                    },
                    {
                        title: "Blockchain for Land Use Data in Kenya",
                        summary: "Kenya is piloting blockchain to secure land use data, reducing fraud and improving urban planning.",
                        date: "2025-04-24",
                        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                        url: "https://www.lands.go.ke/blockchain-land-use",
                        source: "Kenya Ministry of Lands",
                        category: "What's Buzzing",
                        subcategory: "Blockchain"
                    },
                    {
                        title: "Satellite Imagery for Urban Expansion in Nigeria",
                        summary: "Nigeria is using satellite imagery to monitor urban expansion, guiding sustainable city development.",
                        date: "2025-04-23",
                        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.urban.gov.ng/satellite-urban-expansion",
                        source: "Nigeria Ministry of Urban Development",
                        category: "Around the World",
                        subcategory: "Urban Planning"
                    },
                    {
                        title: "AI for Water Resource Management in Egypt",
                        summary: "Egypt is using AI to analyze geospatial data for water resource management, optimizing irrigation and Nile River usage.",
                        date: "2025-04-22",
                        image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                        url: "https://www.mwri.gov.eg/ai-water-management",
                        source: "Egypt Ministry of Water Resources",
                        category: "What's Buzzing",
                        subcategory: "AI Technology"
                    },
                    {
                        title: "Nepal's Climate Vulnerability Mapping with GIS",
                        summary: "Nepal is using GIS to map climate vulnerability zones, guiding adaptation and resilience strategies.",
                        date: "2025-04-21",
                        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                        url: "https://www.moe.gov.np/gis-climate-vulnerability",
                        source: "Nepal Ministry of Environment",
                        category: "In Nepal",
                        subcategory: "Climate"
                    },
                    {
                        title: "Quantum GIS for Traffic Flow Optimization in Spain",
                        summary: "Spain is exploring quantum GIS algorithms to optimize traffic flow in urban areas, reducing congestion.",
                        date: "2025-04-20",
                        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.fomento.gob.es/quantum-gis-traffic",
                        source: "Spain Ministry of Transport",
                        category: "What's Buzzing",
                        subcategory: "Quantum Computing"
                    },
                    {
                        title: "Satellite Monitoring of Deforestation in Indonesia",
                        summary: "Indonesia is using satellite imagery to track deforestation, enforcing conservation policies in protected areas.",
                        date: "2025-04-19",
                        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                        url: "https://www.menlhk.go.id/satellite-deforestation",
                        source: "Indonesia Ministry of Environment",
                        category: "Around the World",
                        subcategory: "Environment"
                    },
                    {
                        title: "Deep Learning for Air Pollution Mapping in China",
                        summary: "China is using deep learning to map air pollution from satellite data, informing public health policies.",
                        date: "2025-04-18",
                        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                        url: "https://www.mee.gov.cn/dl-air-pollution",
                        source: "China Ministry of Ecology and Environment",
                        category: "What's Buzzing",
                        subcategory: "Deep Learning"
                    },
                    {
                        title: "Nepal's Urban Flood Risk Mapping with GIS",
                        summary: "Nepal is using GIS to map urban flood risks in major cities, improving disaster preparedness.",
                        date: "2025-04-17",
                        image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.moud.gov.np/gis-urban-flood",
                        source: "Nepal Ministry of Urban Development",
                        category: "In Nepal",
                        subcategory: "Disaster Management"
                    },
                    {
                        title: "Drones for Archaeological Mapping in Egypt",
                        summary: "Egypt is using drones to map archaeological sites, uncovering hidden structures and aiding preservation.",
                        date: "2025-04-16",
                        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.antiquities.gov.eg/drones-archaeology",
                        source: "Egypt Ministry of Antiquities",
                        category: "Around the World",
                        subcategory: "Remote Sensing"
                    },
                    {
                        title: "AI for Renewable Energy Forecasting in Australia",
                        summary: "Australia is using AI to forecast renewable energy production from geospatial data, stabilizing energy grids.",
                        date: "2025-04-15",
                        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                        url: "https://www.energy.gov.au/ai-renewable-forecasting",
                        source: "Australia Department of Energy",
                        category: "What's Buzzing",
                        subcategory: "AI Technology"
                    },
                    {
                        title: "Satellite-Based Crop Yield Prediction in Ukraine",
                        summary: "Ukraine is using satellite imagery to predict crop yields, supporting agricultural exports and food security.",
                        date: "2025-04-14",
                        image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.minagro.gov.ua/satellite-crop-yield",
                        source: "Ukraine Ministry of Agriculture",
                        category: "Around the World",
                        subcategory: "Agriculture"
                    },
                    {
                        title: "Nepal's Air Pollution Mapping with Drones",
                        summary: "Nepal is using drones to map air pollution in urban areas, supporting environmental health initiatives.",
                        date: "2025-04-13",
                        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                        url: "https://www.moe.gov.np/drones-air-pollution",
                        source: "Nepal Ministry of Environment",
                        category: "In Nepal",
                        subcategory: "Public Health"
                    },
                    {
                        title: "Blockchain for Geospatial Data Authentication in Canada",
                        summary: "Canada is using blockchain to authenticate geospatial data, ensuring reliability for urban planning and research.",
                        date: "2025-04-12",
                        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                        url: "https://www.nrcan.gc.ca/blockchain-data-authentication",
                        source: "Natural Resources Canada",
                        category: "What's Buzzing",
                        subcategory: "Blockchain"
                    },
                    {
                        title: "Satellite Monitoring of Desert Expansion in Saudi Arabia",
                        summary: "Saudi Arabia is using satellite imagery to monitor desert expansion, guiding land reclamation projects.",
                        date: "2025-04-11",
                        image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                        url: "https://www.mecca.gov.sa/satellite-desert-expansion",
                        source: "Saudi Arabia Ministry of Environment",
                        category: "Around the World",
                        subcategory: "Environment"
                    },
                    {
                        title: "Deep Learning for Flood Damage Assessment in Thailand",
                        summary: "Thailand is using deep learning to assess flood damage from satellite imagery, speeding up recovery efforts.",
                        date: "2025-04-10",
                        image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.ddpm.go.th/dl-flood-assessment",
                        source: "Thailand Department of Disaster Prevention",
                        category: "What's Buzzing",
                        subcategory: "Deep Learning"
                    },
                    {
                        title: "Nepal's Renewable Energy Grid Mapping with GIS",
                        summary: "Nepal is using GIS to map renewable energy grids, enhancing integration of solar and hydro power.",
                        date: "2025-04-09",
                        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                        url: "https://www.nea.org.np/gis-renewable-grid",
                        source: "Nepal Electricity Authority",
                        category: "In Nepal",
                        subcategory: "Energy"
                    },
                    {
                        title: "Quantum GIS for Disaster Risk Modeling in Italy",
                        summary: "Italy is exploring quantum GIS for advanced disaster risk modeling, improving preparedness for earthquakes and floods.",
                        date: "2025-04-08",
                        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.protezionecivile.gov.it/quantum-gis-disaster",
                        source: "Italy Civil Protection Department",
                        category: "What's Buzzing",
                        subcategory: "Quantum Computing"
                    },
                    {
                        title: "Satellite-Based Fisheries Management in Japan",
                        summary: "Japan is using satellite imagery to manage fisheries, ensuring sustainable marine resource use.",
                        date: "2025-04-07",
                        image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.maff.go.jp/satellite-fisheries",
                        source: "Japan Ministry of Agriculture, Forestry and Fisheries",
                        category: "Around the World",
                        subcategory: "Fisheries"
                    },
                    {
                        title: "AI for Urban Heat Mitigation in South Africa",
                        summary: "South Africa is using AI to analyze geospatial data for urban heat mitigation, promoting green infrastructure.",
                        date: "2025-04-06",
                        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.environment.gov.za/ai-urban-heat",
                        source: "South Africa Department of Environment",
                        category: "What's Buzzing",
                        subcategory: "AI Technology"
                    },
                    {
                        title: "Nepal's Glacier Lake Mapping with Drones",
                        summary: "Nepal is using drones to map glacial lakes, reducing risks of outburst floods in the Himalayas.",
                        date: "2025-04-05",
                        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.dhm.gov.np/drones-glacier-lake",
                        source: "Nepal Department of Hydrology and Meteorology",
                        category: "In Nepal",
                        subcategory: "Remote Sensing"
                    },
                    {
                        title: "Satellite Monitoring of Wetland Loss in Brazil",
                        summary: "Brazil is using satellite imagery to monitor wetland loss, supporting restoration and biodiversity conservation.",
                        date: "2025-04-04",
                        image: "https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.ibama.gov.br/satellite-wetland-loss",
                        source: "Brazilian Institute of Environment",
                        category: "Around the World",
                        subcategory: "Environment"
                    },
                    {
                        title: "Blockchain for Geospatial Data Security in Germany",
                        summary: "Germany is implementing blockchain to secure geospatial data for infrastructure and environmental applications.",
                        date: "2025-04-03",
                        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                        url: "https://www.bkg.bund.de/blockchain-geospatial-security",
                        source: "Germany Federal Agency for Cartography",
                        category: "What's Buzzing",
                        subcategory: "Blockchain"
                    },
                    {
                        title: "Deep Learning for Landslide Detection in Peru",
                        summary: "Peru is using deep learning to detect landslides from satellite imagery, improving early warning systems.",
                        date: "2025-04-02",
                        image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
                        url: "https://www.ingemmet.gob.pe/dl-landslide-detection",
                        source: "Peru Geological Institute",
                        category: "What's Buzzing",
                        subcategory: "Deep Learning"
                    },
                    {
                        title: "Nepal's Soil Erosion Mapping with GIS",
                        summary: "Nepal is using GIS to map soil erosion, guiding sustainable agricultural practices in hilly regions.",
                        date: "2025-04-01",
                        image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.moald.gov.np/gis-soil-erosion",
                        source: "Nepal Ministry of Agriculture",
                        category: "In Nepal",
                        subcategory: "Agriculture"
                    },
                    {
                        title: "Satellite-Based Air Quality Monitoring in Mexico",
                        summary: "Mexico is using satellite data to monitor air quality, informing policies to reduce urban pollution.",
                        date: "2025-03-31",
                        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80",
                        url: "https://www.inecc.gob.mx/satellite-air-quality",
                        source: "Mexico National Institute of Ecology",
                        category: "Around the World",
                        subcategory: "Public Health"
                    },
                    {
                        title: "AI for Coastal Flood Prediction in the Netherlands",
                        summary: "The Netherlands is using AI to predict coastal floods from geospatial data, enhancing flood defense systems.",
                        date: "2025-03-30",
                        image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.rijkswaterstaat.nl/ai-coastal-flood",
                        source: "Netherlands Ministry of Infrastructure",
                        category: "What's Buzzing",
                        subcategory: "AI Technology"
                    },
                    {
                        title: "GIS for Public Health Planning in Uganda",
                        summary: "Uganda is using GIS to plan public health interventions, optimizing resource allocation for disease control.",
                        date: "2025-03-29",
                        image: "https://images.unsplash.com/photo-1527219525722-f9767a7f2884?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                        url: "https://www.health.go.ug/gis-public-health",
                        source: "Uganda Ministry of Health",
                        category: "Around the World",
                        subcategory: "Public Health"
                    },
                    {
                        title: "Nepal's Heritage Conservation with GIS",
                        summary: "Nepal is using GIS to map and conserve cultural heritage sites, supporting preservation and tourism.",
                        date: "2025-03-28",
                        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.doa.gov.np/gis-heritage-conservation",
                        source: "Nepal Department of Archaeology",
                        category: "In Nepal",
                        subcategory: "Culture"
                    },
                    {
                        title: "Satellite Monitoring of Coral Reefs in the Philippines",
                        summary: "The Philippines is using satellite imagery to monitor coral reef health, supporting marine conservation efforts.",
                        date: "2025-03-27",
                        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
                        url: "https://www.bfar.da.gov.ph/satellite-coral-reefs",
                        source: "Philippines Bureau of Fisheries",
                        category: "Around the World",
                        subcategory: "Environment"
                    },
                    {
                        title: "Quantum GIS for Urban Planning in France",
                        summary: "France is exploring quantum GIS for advanced urban planning, optimizing city layouts and infrastructure.",
                        date: "2025-03-26",
                        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.ign.fr/quantum-gis-urban",
                        source: "French National Geographic Institute",
                        category: "What's Buzzing",
                        subcategory: "Quantum Computing"
                    },
                    {
                        title: "Drones for Urban Mapping in Malaysia",
                        summary: "Malaysia is using drones to map urban areas, supporting smart city development and infrastructure planning.",
                        date: "2025-03-25",
                        image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.townplan.gov.my/drones-urban-mapping",
                        source: "Malaysia Department of Town Planning",
                        category: "Around the World",
                        subcategory: "Remote Sensing"
                    },
                    {
                        title: "Nepal's Water Quality Mapping with Satellite Data",
                        summary: "Nepal is using satellite data to map water quality in rivers and lakes, supporting environmental monitoring.",
                        date: "2025-03-24",
                        image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                        url: "https://www.dwri.gov.np/satellite-water-quality",
                        source: "Nepal Department of Water Resources",
                        category: "In Nepal",
                        subcategory: "Water Management"
                    },
                    {
                        title: "AI for Wildfire Risk Mapping in Spain",
                        summary: "Spain is using AI to map wildfire risks from geospatial data, improving prevention and response strategies.",
                        date: "2025-03-23",
                        image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.miteco.gob.es/ai-wildfire-risk",
                        source: "Spain Ministry for Ecological Transition",
                        category: "What's Buzzing",
                        subcategory: "AI Technology"
                    },
                    {
                        title: "Satellite-Based Crop Insurance in Kenya",
                        summary: "Kenya is using satellite imagery to develop crop insurance models, ensuring fair compensation for farmers.",
                        date: "2025-03-22",
                        image: "https://images.unsplash.com/photo-1586094340401-10108413a8a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.ira.go.ke/satellite-crop-insurance",
                        source: "Kenya Insurance Regulatory Authority",
                        category: "Around the World",
                        subcategory: "Agriculture"
                    },
                    {
                        title: "Deep Learning for Urban Flood Mapping in Indonesia",
                        summary: "Indonesia is using deep learning to map urban flood risks from satellite imagery, guiding disaster preparedness.",
                        date: "2025-03-21",
                        image: "https://images.unsplash.com/photo-1612096536102-930957a562da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.bnpb.go.id/dl-urban-flood",
                        source: "Indonesia National Disaster Management Agency",
                        category: "What's Buzzing",
                        subcategory: "Deep Learning"
                    },
                    {
                        title: "Nepal's Land Tenure Mapping with GIS",
                        summary: "Nepal is using GIS to map land tenure, reducing disputes and improving land management policies.",
                        date: "2025-03-20",
                        image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1396&q=80",
                        url: "https://www.molrm.gov.np/gis-land-tenure",
                        source: "Nepal Ministry of Land Reform",
                        category: "In Nepal",
                        subcategory: "Land Management"
                    },
                    {
                        title: "Blockchain for Geospatial Data Traceability in Japan",
                        summary: "Japan is using blockchain to ensure traceability of geospatial data, enhancing trust in environmental monitoring.",
                        date: "2025-03-19",
                        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80",
                        url: "https://www.mlit.go.jp/blockchain-geospatial-traceability",
                        source: "Japan Ministry of Land, Infrastructure, Transport",
                        category: "What's Buzzing",
                        subcategory: "Blockchain"
                    },
                    {
                        title: "Satellite Monitoring of Glacial Retreat in Chile",
                        summary: "Chile is using satellite imagery to monitor glacial retreat, informing climate adaptation strategies.",
                        date: "2025-03-18",
                        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                        url: "https://www.dga.cl/satellite-glacial-retreat",
                        source: "Chile General Water Directorate",
                        category: "Around the World",
                        subcategory: "Climate"
                    },
                    {
                        title: "AI for Smart City Infrastructure in Singapore",
                        summary: "Singapore is using AI to optimize smart city infrastructure using geospatial data, enhancing urban efficiency.",
                        date: "2025-03-17",
                        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                        url: "https://www.smartnation.gov.sg/ai-smart-city",
                        source: "Singapore Smart Nation Initiative",
                        category: "What's Buzzing",
                        subcategory: "AI Technology"
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
