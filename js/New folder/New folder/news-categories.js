// News Categories JavaScript for Narayan Tripathi's Website
// This script adds category tabs and grouping functionality to the news page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize news categories if on news page
    if (document.getElementById('news-feed')) {
        initializeNewsCategories();
    }
});

// Initialize news categories
function initializeNewsCategories() {
    // Create category tabs container
    createCategoryTabs();
    
    // Set up category filtering
    setupCategoryFiltering();
    
    // Group articles by category
    groupArticlesByCategory();
}

// Create category tabs
function createCategoryTabs() {
    const newsContainer = document.querySelector('.news-refresh-bar');
    if (!newsContainer) return;
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'news-category-tabs';
    
    // Define categories
    const categories = [
        { id: 'all', name: 'All News', icon: 'fa-newspaper' },
        { id: 'world', name: 'Around the World', icon: 'fa-globe' },
        { id: 'nepal', name: 'In Nepal', icon: 'fa-map-marker-alt' },
        { id: 'tech', name: 'What\'s Buzzing', icon: 'fa-bolt' }
    ];
    
    // Create tabs
    categories.forEach(category => {
        const tab = document.createElement('a');
        tab.href = 'javascript:void(0);';
        tab.dataset.category = category.id;
        tab.innerHTML = `<i class="fas ${category.icon}"></i> ${category.name}`;
        tab.className = category.id === 'all' ? 'active' : '';
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.news-category-tabs a').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Filter articles
            filterArticlesByCategory(category.id);
        });
        
        tabsContainer.appendChild(tab);
    });
    
    // Insert tabs after news refresh bar
    newsContainer.parentNode.insertBefore(tabsContainer, newsContainer.nextSibling);
}

// Set up category filtering
function setupCategoryFiltering() {
    // This will be triggered when tabs are clicked
    document.addEventListener('newsArticlesLoaded', function() {
        // Group articles by category
        groupArticlesByCategory();
        
        // Show all articles initially
        filterArticlesByCategory('all');
    });
}

// Filter articles by category
function filterArticlesByCategory(categoryId) {
    const articleGroups = document.querySelectorAll('.news-category-group');
    
    if (categoryId === 'all') {
        // Show all groups
        articleGroups.forEach(group => {
            group.style.display = 'block';
        });
    } else {
        // Show only selected category
        articleGroups.forEach(group => {
            if (group.dataset.category === categoryId) {
                group.style.display = 'block';
            } else {
                group.style.display = 'none';
            }
        });
    }
}

// Group articles by category
function groupArticlesByCategory() {
    const newsFeed = document.getElementById('news-feed');
    if (!newsFeed) return;
    
    // Get all articles
    const articles = Array.from(newsFeed.querySelectorAll('.news-card'));
    if (articles.length === 0) return;
    
    // Clear existing content
    newsFeed.innerHTML = '';
    
    // Define category mapping
    const categoryMapping = {
        'Around the World': 'world',
        'In Nepal': 'nepal',
        'What\'s Buzzing': 'tech'
    };
    
    // Group articles by category
    const groupedArticles = {};
    
    articles.forEach(article => {
        // Get category from article
        let category = article.querySelector('.article-category') ? 
                      article.querySelector('.article-category').textContent : 'Other';
        
        // Map to main category
        let mainCategory = 'Around the World'; // Default
        
        if (category.includes('Nepal') || article.textContent.includes('Nepal')) {
            mainCategory = 'In Nepal';
        } else if (['Technology', 'AI', 'Innovation', 'Trending'].some(term => 
            category.includes(term) || article.textContent.includes(term))) {
            mainCategory = 'What\'s Buzzing';
        }
        
        // Initialize category group if not exists
        if (!groupedArticles[mainCategory]) {
            groupedArticles[mainCategory] = [];
        }
        
        // Add article to group
        groupedArticles[mainCategory].push(article);
    });
    
    // Create category groups
    Object.keys(groupedArticles).forEach(category => {
        // Create category group container
        const groupContainer = document.createElement('div');
        groupContainer.className = 'news-category-group';
        groupContainer.dataset.category = categoryMapping[category];
        
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
            <h2>${category}</h2>
            <div class="category-divider"></div>
        `;
        
        // Create articles container
        const articlesContainer = document.createElement('div');
        articlesContainer.className = 'category-articles';
        
        // Add articles to container
        groupedArticles[category].forEach(article => {
            articlesContainer.appendChild(article.cloneNode(true));
        });
        
        // Add header and articles to group
        groupContainer.appendChild(categoryHeader);
        groupContainer.appendChild(articlesContainer);
        
        // Add group to news feed
        newsFeed.appendChild(groupContainer);
    });
    
    // Dispatch event that articles are loaded and grouped
    const event = new CustomEvent('newsArticlesLoaded');
    document.dispatchEvent(event);
}

// Update grouping when news is refreshed
document.addEventListener('newsRefreshed', function() {
    // Group articles by category after refresh
    setTimeout(groupArticlesByCategory, 500);
});
