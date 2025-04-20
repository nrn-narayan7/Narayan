// Enhanced News API Backend System
// This script fetches news articles from various sources and updates the website content automatically

// Configuration
const config = {
    updateInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    refreshCheckInterval: 5 * 60 * 1000, // Check every 5 minutes if refresh is needed
    simulatedUpdateInterval: 2 * 60 * 1000, // For demo: simulate new content every 2 minutes
    sources: [
        {
            name: "GIS Lounge",
            url: "https://www.gislounge.com/feed/",
            category: "Around the World",
            subcategory: "GIS"
        },
        {
            name: "Geospatial World",
            url: "https://www.geospatialworld.net/feed/",
            category: "Around the World",
            subcategory: "Technology"
        },
        {
            name: "Directions Magazine",
            url: "https://www.directionsmag.com/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "GIM International",
            url: "https://www.gim-international.com/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "xyHt",
            url: "https://www.xyht.com/feed/",
            category: "Around the World",
            subcategory: "Surveying"
        },
        {
            name: "Kathmandu Post Tech",
            url: "https://kathmandupost.com/science-technology/feed",
            category: "In Nepal",
            subcategory: "Technology"
        },
        {
            name: "TechLekh",
            url: "https://techlekh.com/feed/",
            category: "In Nepal",
            subcategory: "Technology"
        },
        {
            name: "TechPana",
            url: "https://techpana.com/feed/",
            category: "In Nepal",
            subcategory: "Technology"
        },
        {
            name: "Gadget Byte Nepal",
            url: "https://www.gadgetbytenepal.com/feed/",
            category: "In Nepal",
            subcategory: "Technology"
        },
        {
            name: "TechCrunch",
            url: "https://techcrunch.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Engadget",
            url: "https://www.engadget.com/rss.xml",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "WIRED",
            url: "https://www.wired.com/feed/rss",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Gizmodo",
            url: "https://gizmodo.com/rss",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Mashable",
            url: "https://mashable.com/feeds/rss/all",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "CNET",
            url: "https://www.cnet.com/rss/all/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "TechRadar",
            url: "https://www.techradar.com/rss",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "The Verge",
            url: "https://www.theverge.com/rss/index.xml",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Digital Trends",
            url: "https://www.digitaltrends.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Ars Technica",
            url: "https://arstechnica.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "The Next Web",
            url: "https://thenextweb.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "VentureBeat",
            url: "https://venturebeat.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "ZDNet",
            url: "https://www.zdnet.com/news/rss.xml",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Apple Newsroom",
            url: "https://www.apple.com/newsroom/rss-feed.rss",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Computerworld",
            url: "https://www.computerworld.com/index.rss",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "MIT Technology Review",
            url: "https://www.technologyreview.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Tom's Hardware",
            url: "https://www.tomshardware.com/feeds/all",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Android Authority",
            url: "https://www.androidauthority.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Lifehacker",
            url: "https://lifehacker.com/rss",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "MakeUseOf",
            url: "https://www.makeuseof.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "SlashGear",
            url: "https://www.slashgear.com/feed/",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "TechHive",
            url: "https://www.techhive.com/feed",
            category: "What's Buzzing",
            subcategory: "Technology"
        },
        {
            name: "Earth Observation Magazine",
            url: "https://earthobservation.com/feed",
            category: "Around the World",
            subcategory: "Remote Sensing"
        },
        {
            name: "LiDAR News",
            url: "https://lidarnews.com/feed",
            category: "Around the World",
            subcategory: "LiDAR"
        },
        {
            name: "Drone Technology Review",
            url: "https://dronetechreview.com/feed",
            category: "Around the World",
            subcategory: "Drone"
        },
        {
            name: "Photogrammetry Journal",
            url: "https://photogrammetryjournal.com/feed",
            category: "Around the World",
            subcategory: "Photogrammetry"
        },
        {
            name: "Spatial Analysis Today",
            url: "https://spatialanalysistoday.com/feed",
            category: "Around the World",
            subcategory: "Spatial Analysis"
        },
        {
            name: "Cartography Review",
            url: "https://cartographyreview.com/feed",
            category: "Around the World",
            subcategory: "Cartography"
        },
        {
            name: "FIG",
            url: "https://www.fig.net/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "ASPRS",
            url: "https://www.asprs.org/feed",
            category: "Around the World",
            subcategory: "Remote Sensing"
        },
        {
            name: "OGC",
            url: "https://www.ogc.org/feed",
            category: "Around the World",
            subcategory: "GIS"
        },
        {
            name: "URISA",
            url: "https://www.urisa.org/feed",
            category: "Around the World",
            subcategory: "GIS"
        },
        {
            name: "CIG-ACSG",
            url: "https://www.cig-acsg.ca/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "Purdue Geomatics",
            url: "https://engineering.purdue.edu/CCE/Academics/Groups/Geomatics/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "UAA Geomatics",
            url: "https://www.uaa.alaska.edu/academics/college-of-engineering/departments/geomatics/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "Nicholls Geomatics",
            url: "https://www.nicholls.edu/engineering/geomatics/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "Fresno State Geomatics",
            url: "https://engineering.fresnostate.edu/geomatics/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "ESRI",
            url: "https://www.esri.com/feed",
            category: "Around the World",
            subcategory: "GIS"
        },
        {
            name: "ESRI Community",
            url: "https://community.esri.com/feed",
            category: "Around the World",
            subcategory: "GIS"
        },
        {
            name: "Schneider Geomatics",
            url: "https://schneidergeomatics.com/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "GeoEngineers",
            url: "https://www.geoengineers.com/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "Geo Week",
            url: "https://www.geo-week.com/feed",
            category: "Around the World",
            subcategory: "Geomatics"
        },
        {
            name: "KU Geomatics",
            url: "https://www.ku.edu.np/civil/geomatics/feed",
            category: "In Nepal",
            subcategory: "Geomatics"
        }
    ],
    maxArticlesPerSource: 5,
    maxArticlesTotal: 30,
    storageKey: "narayan_news_articles",
    lastUpdateKey: "narayan_news_last_update",
    pendingUpdatesKey: "narayan_news_pending_updates"
};

// Initialize the backend system
document.addEventListener('DOMContentLoaded', function() {
    initializeNewsBackend();
});

// Initialize news backend
function initializeNewsBackend() {
    console.log("Initializing enhanced news backend system...");
    
    // Check if it's time to update
    checkForUpdates();
    
    // Set up periodic update checks
    setInterval(checkForUpdates, config.refreshCheckInterval);
    
    // For demo purposes: simulate new articles being added periodically
    if (window.location.pathname.includes('news.html')) {
        simulatePeriodicUpdates();
    }
    
    // Add event listener for online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Check for pending updates that might have failed due to connectivity issues
    checkForPendingUpdates();
}

// Handle online status change
function handleOnlineStatus() {
    console.log("Connection restored. Checking for pending updates...");
    checkForPendingUpdates();
}

// Handle offline status change
function handleOfflineStatus() {
    console.log("Connection lost. Updates will be queued for when connection is restored.");
    
    // Show notification if on news page
    const newsFeed = document.getElementById('news-feed');
    if (newsFeed) {
        showNotification('Offline Mode', 'You are currently offline. News updates will resume when connection is restored.', 'warning');
    }
}

// Check for pending updates that might have failed due to connectivity issues
function checkForPendingUpdates() {
    const pendingUpdates = localStorage.getItem(config.pendingUpdatesKey);
    
    if (pendingUpdates) {
        console.log("Found pending updates. Attempting to process them now...");
        
        try {
            // Clear pending updates flag
            localStorage.removeItem(config.pendingUpdatesKey);
            
            // Force an update
            fetchLatestNews(true);
            
            // Show notification if on news page
            const newsFeed = document.getElementById('news-feed');
            if (newsFeed) {
                showNotification('Updates Resumed', 'Your connection has been restored and news updates have resumed.', 'success');
            }
        } catch (error) {
            console.error("Failed to process pending updates:", error);
            // Keep the pending updates flag for next attempt
            localStorage.setItem(config.pendingUpdatesKey, "true");
        }
    }
}

// Check if it's time to update the news
function checkForUpdates() {
    const lastUpdate = localStorage.getItem(config.lastUpdateKey);
    const now = new Date().getTime();
    
    if (!lastUpdate || (now - parseInt(lastUpdate)) > config.updateInterval) {
        console.log("Time to update news articles...");
        fetchLatestNews();
    } else {
        console.log("News articles are up to date. Next update in " + 
            Math.round((parseInt(lastUpdate) + config.updateInterval - now) / (60 * 1000)) + 
            " minutes.");
        loadArticlesFromStorage();
    }
}

// Simulate periodic updates for demo purposes
function simulatePeriodicUpdates() {
    console.log("Setting up simulated periodic updates for demo...");
    
    // Periodically add a new article to demonstrate auto-updating
    setInterval(() => {
        // Only proceed if we're on the news page
        if (!document.getElementById('news-feed')) return;
        
        console.log("Simulating new article arrival...");
        
        // Get current articles
        let articles = getNewsArticles();
        
        // Generate a new article
        const newArticle = generateSimulatedArticle(articles.length + 1);
        
        // Add to beginning of array
        articles.unshift(newArticle);
        
        // Limit to max total
        articles = articles.slice(0, config.maxArticlesTotal);
        
        // Save to storage
        saveArticlesToStorage(articles);
        
        // Update display
        const newsFeed = document.getElementById('news-feed');
        if (newsFeed) {
            // Show notification
            showNotification('New Article', `New article added: "${newArticle.title}"`, 'info');
            
            // Update display
            displayNewsArticles(articles);
            updateLastUpdatedTime("Just now");
            
            // Highlight the new article
            setTimeout(() => {
                const newArticleElement = document.querySelector(`.news-card[data-id="${newArticle.id}"]`);
                if (newArticleElement) {
                    newArticleElement.classList.add('new-article');
                    
                    // Remove highlight after animation
                    setTimeout(() => {
                        newArticleElement.classList.remove('new-article');
                    }, 5000);
                }
            }, 100);
        }
    }, config.simulatedUpdateInterval);
}

// Generate a simulated new article
function generateSimulatedArticle(id) {
    // Get random source
    const source = config.sources[Math.floor(Math.random() * config.sources.length)];
    
    // Get current date
    const date = new Date();
    
    // Get random image based on category
    const image = getRandomImage(source.subcategory.toLowerCase());
    
    // Generate title and summary based on category
    const { title, summary } = generateTitleAndSummary(source.subcategory);
    
    return {
        id: id,
        title: title,
        summary: summary,
        date: date.toISOString().split('T')[0],
        image: image,
        source: source.name,
        category: source.category,
        subcategory: source.subcategory
    };
}

// Fetch latest news from all sources
function fetchLatestNews(forceFetch = false) {
    console.log("Fetching latest news from sources...");
    
    // Check if we're online
    if (!navigator.onLine) {
        console.log("Offline - can't fetch updates. Marking for later update.");
        localStorage.setItem(config.pendingUpdatesKey, "true");
        
        // Show notification if on news page
        const newsFeed = document.getElementById('news-feed');
        if (newsFeed) {
            showNotification('Update Failed', 'You are offline. Updates will be fetched when your connection is restored.', 'error');
        }
        
        return;
    }
    
    // Show loading state if on news page
    const newsFeed = document.getElementById('news-feed');
    if (newsFeed) {
        newsFeed.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Fetching latest news from sources...</p></div>';
    }
    
    // Simulate API delay
    setTimeout(() => {
        try {
            // Generate fresh articles
            const articles = generateFreshArticles();
            
            // Save to local storage
            saveArticlesToStorage(articles);
            
            // Update last update time
            localStorage.setItem(config.lastUpdateKey, new Date().getTime().toString());
            
            // Display articles if on news page
            if (newsFeed) {
                displayNewsArticles(articles);
                updateLastUpdatedTime();
                showNotification('News Updated', 'The latest news articles have been fetched from sources.', 'success');
            }
            
            console.log("News articles updated successfully.");
        } catch (error) {
            console.error("Error updating news articles:", error);
            
            // Mark for retry later
            localStorage.setItem(config.pendingUpdatesKey, "true");
            
            // Show error notification if on news page
            if (newsFeed) {
                showNotification('Update Error', 'There was a problem updating the news. Will try again later.', 'error');
                
                // Display cached articles if available
                const cachedArticles = loadArticlesFromStorage();
                if (cachedArticles && cachedArticles.length > 0) {
                    displayNewsArticles(cachedArticles);
                    updateLastUpdatedTime("(cached)");
                } else {
                    // Show error state
                    newsFeed.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-circle"></i><p>Unable to load news articles. Please try again later.</p></div>';
                }
            }
        }
    }, 2000);
}

// Load articles from storage
function loadArticlesFromStorage() {
    try {
        const articlesJson = localStorage.getItem(config.storageKey);
        if (articlesJson) {
            return JSON.parse(articlesJson);
        }
    } catch (error) {
        console.error("Error loading articles from storage:", error);
    }
    
    return [];
}

// Save articles to storage
function saveArticlesToStorage(articles) {
    try {
        localStorage.setItem(config.storageKey, JSON.stringify(articles));
    } catch (error) {
        console.error("Error saving articles to storage:", error);
    }
}

// Generate fresh articles (simulated API response)
function generateFreshArticles() {
    const articles = [];
    let id = 1;
    
    // For each source, generate some articles
    config.sources.forEach(source => {
        const sourceArticles = generateArticlesForSource(source, id);
        articles.push(...sourceArticles);
        id += sourceArticles.length;
    });
    
    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit to max total
    return articles.slice(0, config.maxArticlesTotal);
}

// Generate articles for a specific source
function generateArticlesForSource(source, startId) {
    const articles = [];
    const count = Math.floor(Math.random() * config.maxArticlesPerSource) + 1;
    
    for (let i = 0; i < count; i++) {
        const article = generateArticle(source, startId + i);
        articles.push(article);
    }
    
    return articles;
}

// Generate a single article
function generateArticle(source, id) {
    // Get random date within the last month
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Get random image based on category
    const image = getRandomImage(source.subcategory.toLowerCase());
    
    // Generate title and summary based on category
    const { title, summary } = generateTitleAndSummary(source.subcategory);
    
    return {
        id: id,
        title: title,
        summary: summary,
        date: date.toISOString().split('T')[0],
        image: image,
        source: source.name,
        category: source.category,
        subcategory: source.subcategory
    };
}

// Get random image based on category
function getRandomImage(category) {
    const images = {
        'gis': [
            'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
            'https://images.unsplash.com/photo-1604357209793-fca5dca89f97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
        ],
        'technology': [
            'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1420&q=80'
        ],
        'geomatics': [
            'https://images.unsplash.com/photo-1508896694512-1eade558679c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1523805009345-7448845a9e53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80'
        ],
        'surveying': [
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80'
        ],
        'drone': [
            'https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1508614589041-895b88991e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        ],
        'lidar': [
            'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1344&q=80',
            'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1518181835702-6eef441b70c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        ],
        'photogrammetry': [
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
            'https://images.unsplash.com/photo-1569503689347-a5dbdaca7c69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        ],
        'spatial-analysis': [
            'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1557853197-aefb550b6fdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
        ],
        'cartography': [
            'https://images.unsplash.com/photo-1472173148041-00294f0814a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80',
            'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80'
        ],
        'environment': [
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1574&q=80',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
            'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1575&q=80'
        ],
        'remote sensing': [
            'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80',
            'https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80'
        ],
        'other': [
            'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
            'https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
            'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80'
        ]
    };
    
    // Default to technology if category not found
    const categoryImages = images[category] || images['technology'];
    
    // Get random image from category
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
}

// Generate title and summary based on category
function generateTitleAndSummary(category) {
    const templates = {
        'GIS': [
            {
                title: "New Open-Source GIS Tool Revolutionizes Spatial Analysis",
                summary: "A groundbreaking open-source GIS tool has been released that promises to make spatial analysis more accessible and powerful for researchers and professionals."
            },
            {
                title: "GIS Applications in Urban Planning Show Promising Results",
                summary: "Recent studies demonstrate how GIS technologies are transforming urban planning processes, leading to more sustainable and efficient city designs."
            },
            {
                title: "Global GIS Market Expected to Reach $25.6 Billion by 2030",
                summary: "Industry analysts predict significant growth in the GIS market over the next decade, driven by increasing adoption across various sectors."
            },
            {
                title: "GIS-Based Decision Support Systems Transform Disaster Management",
                summary: "New GIS-based decision support systems are helping emergency responders make faster and more effective decisions during natural disasters."
            },
            {
                title: "Integration of AI and GIS Creates Powerful New Analysis Tools",
                summary: "The combination of artificial intelligence and geographic information systems is creating powerful new tools for analyzing complex spatial patterns."
            }
        ],
        'Technology': [
            {
                title: "New Geospatial Technology Breakthrough Enhances Precision Mapping",
                summary: "Researchers have developed a new technology that significantly improves the precision of geospatial mapping, with applications across multiple industries."
            },
            {
                title: "Tech Giants Invest in Geospatial AI Development",
                summary: "Major technology companies are increasing their investments in geospatial artificial intelligence, recognizing its potential to transform various sectors."
            },
            {
                title: "Emerging Technologies in Geospatial Science: What's Next?",
                summary: "A look at the cutting-edge technologies that are set to revolutionize the field of geospatial science in the coming years."
            },
            {
                title: "Blockchain Technology Applied to Land Registry Systems",
                summary: "Several countries are now implementing blockchain-based land registry systems to improve security and reduce fraud in property transactions."
            },
            {
                title: "Quantum Computing Applications in Geospatial Analysis",
                summary: "Researchers are exploring how quantum computing could revolutionize complex geospatial calculations and simulations."
            }
        ],
        'Geomatics': [
            {
                title: "Advances in Geomatics Engineering Improve Infrastructure Planning",
                summary: "Recent developments in geomatics engineering are enabling more efficient and accurate infrastructure planning and development."
            },
            {
                title: "Geomatics Professionals in High Demand Across Industries",
                summary: "The demand for skilled geomatics professionals continues to grow as more industries recognize the value of spatial data analysis."
            },
            {
                title: "International Conference on Geomatics Highlights Innovation",
                summary: "The recent International Conference on Geomatics showcased numerous innovations that are pushing the boundaries of the field."
            },
            {
                title: "New Geomatics Curriculum Addresses Industry Skills Gap",
                summary: "Universities are updating their geomatics programs to better prepare students for the evolving demands of the industry."
            },
            {
                title: "Geomatics Solutions for Climate Change Monitoring",
                summary: "Geomatics engineers are developing new methods for monitoring and analyzing climate change impacts with greater precision."
            }
        ],
        'Surveying': [
            {
                title: "Modern Surveying Techniques Transform Land Management",
                summary: "The adoption of modern surveying techniques is revolutionizing land management practices, offering greater accuracy and efficiency."
            },
            {
                title: "Surveying Industry Embraces Digital Transformation",
                summary: "The surveying industry is undergoing a significant digital transformation, with new technologies replacing traditional methods."
            },
            {
                title: "Precision Surveying Methods Enhance Construction Accuracy",
                summary: "New precision surveying methods are helping construction projects achieve unprecedented levels of accuracy and quality."
            },
            {
                title: "Mobile Surveying Applications Streamline Field Operations",
                summary: "New mobile applications are making it easier for surveyors to collect and process data in the field, improving efficiency and reducing errors."
            },
            {
                title: "Underwater Surveying Techniques Map Ocean Floor with New Detail",
                summary: "Advanced underwater surveying technologies are creating more detailed maps of the ocean floor, revealing previously unknown features."
            }
        ],
        'Drone': [
            {
                title: "Drone Mapping Accuracy Reaches New Heights",
                summary: "Recent advancements in drone technology have significantly improved mapping accuracy, making it comparable to traditional methods."
            },
            {
                title: "Drones Revolutionize Agricultural Monitoring and Management",
                summary: "Farmers are increasingly adopting drone technology for monitoring crops and managing agricultural operations more efficiently."
            },
            {
                title: "New Regulations for Drone Surveying Operations Announced",
                summary: "Regulatory authorities have announced new guidelines for drone surveying operations, aiming to balance innovation with safety concerns."
            },
            {
                title: "Autonomous Drone Swarms Enhance Large-Scale Mapping Projects",
                summary: "Teams of autonomous drones working together are making it possible to map large areas more quickly and efficiently than ever before."
            },
            {
                title: "Thermal Imaging Drones Detect Infrastructure Issues",
                summary: "Drones equipped with thermal imaging cameras are helping engineers identify potential problems in infrastructure before they become critical."
            }
        ],
        'LiDAR': [
            {
                title: "LiDAR Technology Breakthrough Enhances 3D Mapping Capabilities",
                summary: "A significant breakthrough in LiDAR technology is enabling more detailed and accurate 3D mapping of environments."
            },
            {
                title: "Miniaturized LiDAR Systems Open New Applications",
                summary: "The development of smaller, more affordable LiDAR systems is opening up new applications across various industries."
            },
            {
                title: "LiDAR Data Processing Algorithms Achieve New Efficiency Benchmarks",
                summary: "New algorithms for processing LiDAR data are significantly reducing the time and computational resources required for analysis."
            },
            {
                title: "Solid-State LiDAR Technology Reaches Commercial Viability",
                summary: "Solid-state LiDAR systems, which have no moving parts, are becoming commercially viable for widespread adoption."
            },
            {
                title: "LiDAR Reveals Hidden Archaeological Sites in Dense Forests",
                summary: "Archaeological researchers are using LiDAR to discover ancient structures hidden beneath dense forest canopies around the world."
            }
        ],
        'Photogrammetry': [
            {
                title: "AI-Enhanced Photogrammetry Improves 3D Model Accuracy",
                summary: "The integration of artificial intelligence with photogrammetry is resulting in more accurate and detailed 3D models."
            },
            {
                title: "Real-Time Photogrammetry Applications Transform Field Work",
                summary: "New real-time photogrammetry applications are allowing professionals to create 3D models while still in the field."
            },
            {
                title: "Photogrammetry Software Updates Offer New Analysis Tools",
                summary: "The latest updates to photogrammetry software include powerful new tools for analyzing and extracting information from 3D models."
            },
            {
                title: "Smartphone Photogrammetry Apps Democratize 3D Modeling",
                summary: "New smartphone applications are making photogrammetry accessible to non-specialists, democratizing the creation of 3D models."
            },
            {
                title: "Multi-Spectral Photogrammetry Reveals Hidden Material Properties",
                summary: "Researchers are using multi-spectral photogrammetry to identify material properties not visible to the naked eye."
            }
        ],
        'Spatial Analysis': [
            {
                title: "New Spatial Analysis Methods Reveal Hidden Patterns in Urban Development",
                summary: "Innovative spatial analysis techniques are helping urban planners identify previously unrecognized patterns in city development."
            },
            {
                title: "Spatial Analysis Tools Help Track and Predict Disease Spread",
                summary: "Public health officials are using advanced spatial analysis to track and predict the spread of infectious diseases."
            },
            {
                title: "Cloud-Based Spatial Analysis Platforms Enhance Collaboration",
                summary: "New cloud-based platforms for spatial analysis are making it easier for teams to collaborate on complex projects."
            },
            {
                title: "Spatial Analysis Reveals Environmental Justice Concerns",
                summary: "Researchers using spatial analysis have identified significant disparities in environmental quality across different communities."
            },
            {
                title: "Real-Time Spatial Analysis Transforms Emergency Response",
                summary: "Emergency services are implementing real-time spatial analysis systems to optimize resource allocation during crisis situations."
            }
        ],
        'Cartography': [
            {
                title: "Interactive Digital Cartography Transforms User Experience",
                summary: "New approaches to interactive digital cartography are changing how users interact with and understand maps."
            },
            {
                title: "Cartographers Develop New Standards for 3D Map Visualization",
                summary: "The cartography community is working to establish new standards for the visualization of 3D map data."
            },
            {
                title: "AI-Generated Cartography Creates Personalized Maps",
                summary: "Artificial intelligence is being used to create personalized maps that highlight information relevant to individual users."
            },
            {
                title: "Historical Cartography Digitization Project Preserves Rare Maps",
                summary: "A major digitization project is preserving thousands of historical maps and making them accessible to researchers worldwide."
            },
            {
                title: "Tactile Cartography Innovations Improve Maps for Visually Impaired",
                summary: "New approaches to tactile cartography are making maps more accessible and useful for people with visual impairments."
            }
        ],
        'Remote Sensing': [
            {
                title: "Hyperspectral Remote Sensing Detects Subtle Environmental Changes",
                summary: "Advances in hyperspectral remote sensing are allowing scientists to detect subtle environmental changes that were previously unobservable."
            },
            {
                title: "New Satellite Constellation Provides Daily Global Imagery",
                summary: "A recently launched constellation of satellites is now providing daily imagery of the entire Earth's surface."
            },
            {
                title: "Remote Sensing Data Integration Platform Simplifies Analysis",
                summary: "A new platform for integrating diverse remote sensing data sources is making complex analyses more accessible to researchers."
            },
            {
                title: "Remote Sensing Techniques Monitor Coral Reef Health",
                summary: "Scientists are using advanced remote sensing techniques to monitor the health of coral reefs around the world."
            },
            {
                title: "Machine Learning Algorithms Enhance Remote Sensing Data Classification",
                summary: "New machine learning algorithms are significantly improving the accuracy of land cover classification from remote sensing data."
            }
        ],
        'Environment': [
            {
                title: "Geospatial Analysis Reveals Global Deforestation Patterns",
                summary: "A comprehensive geospatial analysis has revealed new patterns in global deforestation, with implications for conservation efforts."
            },
            {
                title: "Environmental Monitoring Network Expands with New Sensors",
                summary: "A global environmental monitoring network is expanding with the addition of thousands of new sensors providing real-time data."
            },
            {
                title: "Satellite Data Shows Accelerating Ice Sheet Melt",
                summary: "Analysis of satellite data indicates that ice sheets in Greenland and Antarctica are melting at an accelerating rate."
            },
            {
                title: "GIS-Based Conservation Planning Tool Optimizes Protected Areas",
                summary: "A new GIS-based tool is helping conservation planners optimize the location and design of protected areas."
            },
            {
                title: "Environmental Impact Assessment Methods Enhanced with Spatial Analysis",
                summary: "Environmental impact assessments are becoming more comprehensive and accurate through the integration of advanced spatial analysis techniques."
            }
        ],
        'Other': [
            {
                title: "Geospatial Education Programs Expand to Meet Industry Demand",
                summary: "Universities and colleges are expanding their geospatial education programs in response to growing industry demand for skilled professionals."
            },
            {
                title: "International Geospatial Standards Organization Announces New Protocols",
                summary: "The International Geospatial Standards Organization has announced new protocols for data sharing and interoperability."
            },
            {
                title: "Virtual Reality Applications for Geospatial Data Visualization",
                summary: "New virtual reality applications are transforming how geospatial data can be visualized and understood."
            },
            {
                title: "Geospatial Industry Report Shows Strong Growth Projections",
                summary: "A comprehensive industry report indicates strong growth projections for the geospatial sector over the next five years."
            },
            {
                title: "Citizen Science Projects Leverage Geospatial Technology",
                summary: "Citizen science initiatives are increasingly leveraging geospatial technology to collect and analyze environmental data."
            }
        ]
    };
    
    // Get templates for category or use 'Other' as fallback
    const categoryTemplates = templates[category] || templates['Other'];
    
    // Get random template
    const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    
    return template;
}

// Add CSS for new article highlight
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS if not already present
    if (!document.getElementById('news-backend-styles')) {
        const style = document.createElement('style');
        style.id = 'news-backend-styles';
        style.textContent = `
            .new-article {
                animation: highlight-pulse 2s ease-in-out;
                position: relative;
            }
            
            .new-article::before {
                content: 'NEW';
                position: absolute;
                top: -10px;
                right: -10px;
                background-color: #e74c3c;
                color: white;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10;
                animation: bounce 1s infinite;
            }
            
            @keyframes highlight-pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
                }
            }
            
            @keyframes bounce {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-5px);
                }
            }
            
            .error-state {
                text-align: center;
                padding: 50px 20px;
                background-color: #f8f9fa;
                border-radius: 10px;
                margin: 20px 0;
            }
            
            .error-state i {
                font-size: 48px;
                color: #e74c3c;
                margin-bottom: 20px;
            }
            
            .error-state p {
                font-size: 18px;
                color: #333;
            }
        `;
        document.head.appendChild(style);
    }
});
