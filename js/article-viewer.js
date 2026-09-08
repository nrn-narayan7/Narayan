// // Enhanced Article Viewer with Fixed URL Handling

// // Initialize article viewer system
// document.addEventListener('DOMContentLoaded', function() {
//     // Create article viewer modal if it doesn't exist
//     if (!document.getElementById('article-viewer-modal')) {
//         createArticleViewer();
//     }
    
//     // Handle article URLs on page load
//     handleArticleFromUrl();
    
//     // Listen for popstate events (browser back/forward)
//     window.addEventListener('popstate', function(event) {
//         if (event.state && event.state.articleId) {
//             openArticleViewer(event.state.articleId);
//         } else {
//             closeArticleViewer();
//         }
//     });
// });

// // Create article viewer modal
// function createArticleViewer() {
//     // Create a modal container for article viewing
//     const modalContainer = document.createElement('div');
//     modalContainer.id = 'article-viewer-modal';
//     modalContainer.className = 'article-viewer-modal';
//     modalContainer.innerHTML = `
//         <div class="article-viewer-content">
//             <div class="article-viewer-header">
//                 <h2 class="article-title"></h2>
//                 <button class="close-button"><i class="fas fa-times"></i></button>
//             </div>
//             <div class="article-viewer-body">
//                 <div class="article-metadata">
//                     <span class="article-date"></span>
//                     <span class="article-source"></span>
//                     <span class="article-category"></span>
//                 </div>
//                 <div class="article-image-container">
//                     <img class="article-image" src="" alt="" onerror="this.src='images/fallback-news.jpg'">
//                 </div>
//                 <div class="article-content">
//                     <p class="article-summary"></p>
//                     <div class="article-full-content"></div>
//                 </div>
//             </div>
//             <div class="article-viewer-footer">
//                 <div class="article-tags"></div>
//                 <div class="article-share">
//                     <span>Share: </span>
//                     <a href="#" class="share-twitter" target="_blank"><i class="fab fa-twitter"></i></a>
//                     <a href="#" class="share-facebook" target="_blank"><i class="fab fa-facebook-f"></i></a>
//                     <a href="#" class="share-linkedin" target="_blank"><i class="fab fa-linkedin-in"></i></a>
//                     <a href="#" class="share-email"><i class="fas fa-envelope"></i></a>
//                 </div>
//                 <div class="article-navigation">
//                     <button class="prev-article" title="Previous Article"><i class="fas fa-chevron-left"></i> Previous</button>
//                     <button class="next-article" title="Next Article">Next <i class="fas fa-chevron-right"></i></button>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     document.body.appendChild(modalContainer);
    
//     // Add event listener to close button
//     const closeButton = modalContainer.querySelector('.close-button');
//     closeButton.addEventListener('click', function() {
//         closeArticleViewer();
//     });
    
//     // Close when clicking outside the content
//     modalContainer.addEventListener('click', function(e) {
//         if (e.target === modalContainer) {
//             closeArticleViewer();
//         }
//     });
    
//     // Close on escape key
//     document.addEventListener('keydown', function(e) {
//         if (e.key === 'Escape') {
//             closeArticleViewer();
//         }
//     });
    
//     // Add event listeners for navigation buttons
//     const prevButton = modalContainer.querySelector('.prev-article');
//     const nextButton = modalContainer.querySelector('.next-article');
    
//     prevButton.addEventListener('click', function() {
//         navigateArticle('prev');
//     });
    
//     nextButton.addEventListener('click', function() {
//         navigateArticle('next');
//     });
    
//     // Add animation classes
//     modalContainer.querySelector('.article-viewer-content').classList.add('fade-in');
//     modalContainer.querySelector('.article-tags').classList.add('stagger-animation');
//     modalContainer.querySelector('.article-image-container').classList.add('shine-effect');
    
//     return modalContainer;
// }

// // Handle article from URL
// function handleArticleFromUrl() {
//     // Check if URL contains article ID or slug
//     const urlPath = window.location.pathname;
    
//     // Handle numeric IDs (e.g., /article/123)
//     const articleIdMatch = urlPath.match(/\/article\/(\d+)/);
//     if (articleIdMatch && articleIdMatch[1]) {
//         const articleId = parseInt(articleIdMatch[1]);
//         openArticleViewer(articleId);
//         return;
//     }
    
//     // Handle slug-based URLs (e.g., /article/satellite-imagery-forest-cover)
//     const articleSlugMatch = urlPath.match(/\/article\/([a-z0-9-]+)/);
//     if (articleSlugMatch && articleSlugMatch[1]) {
//         const articleSlug = articleSlugMatch[1];
//         openArticleBySlug(articleSlug);
//         return;
//     }
// }

// // Open article by slug
// function openArticleBySlug(slug) {
//     const articles = getNewsArticles();
    
//     // Find article with matching slug
//     const article = articles.find(article => {
//         // Generate slug from title
//         const articleSlug = generateSlug(article.title);
//         return articleSlug === slug;
//     });
    
//     if (article) {
//         openArticleViewer(article.id);
//     } else {
//         // If no matching article found, redirect to news page
//         if (window.location.pathname !== '/news.html') {
//             window.location.href = 'news.html';
//         }
//     }
// }

// // Generate slug from title
// function generateSlug(title) {
//     return title
//         .toLowerCase()
//         .replace(/[^\w\s-]/g, '') // Remove special characters
//         .replace(/\s+/g, '-') // Replace spaces with hyphens
//         .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
//         .trim(); // Trim leading/trailing spaces
// }

// // Open article viewer with article data
// function openArticleViewer(articleId) {
//     // Get article data
//     const article = getArticleById(articleId);
//     if (!article) {
//         // If article not found, redirect to news page
//         if (window.location.pathname !== '/news.html') {
//             window.location.href = 'news.html';
//         }
//         return;
//     }
    
//     // Get or create modal
//     let modal = document.getElementById('article-viewer-modal');
//     if (!modal) {
//         modal = createArticleViewer();
//     }
    
//     // Generate article slug
//     const articleSlug = generateSlug(article.title);
    
//     // Populate modal with article data
//     modal.querySelector('.article-title').textContent = article.title;
//     modal.querySelector('.article-date').textContent = formatDate(new Date(article.date));
//     modal.querySelector('.article-source').textContent = `Source: ${article.source}`;
//     modal.querySelector('.article-category').textContent = `${article.category} / ${article.subcategory}`;
//     modal.querySelector('.article-image').src = article.image;
//     modal.querySelector('.article-image').alt = article.title;
//     modal.querySelector('.article-summary').textContent = article.summary;
    
//     // Generate full content
//     const fullContent = generateArticleContent(article);
//     modal.querySelector('.article-full-content').innerHTML = fullContent;
    
//     // Generate tags
//     const tagsHtml = generateArticleTags(article);
//     modal.querySelector('.article-tags').innerHTML = tagsHtml;
    
//     // Update share links
//     updateShareLinks(modal, article);
    
//     // Update navigation buttons
//     updateNavigationButtons(articleId);
    
//     // Show modal with animation
//     modal.style.display = 'flex';
//     document.body.style.overflow = 'hidden'; // Prevent scrolling
    
//     // Add to browser history using slug for better SEO
//     const articleUrl = `/article/${articleSlug}`;
    
//     // Only push state if we're not already on this article
//     if (window.location.pathname !== articleUrl) {
//         window.history.pushState({articleId: article.id}, article.title, articleUrl);
//     }
    
//     // Track view
//     trackArticleView(article.id);
    
//     // Apply animations
//     const content = modal.querySelector('.article-viewer-content');
//     content.classList.add('fade-in');
    
//     // Animate tags
//     const tags = modal.querySelector('.article-tags');
//     tags.classList.add('stagger-animation');
//     setTimeout(() => {
//         tags.classList.add('visible');
//     }, 100);
// }

// // Close article viewer
// function closeArticleViewer() {
//     const modal = document.getElementById('article-viewer-modal');
//     if (modal) {
//         // Add closing animation
//         const content = modal.querySelector('.article-viewer-content');
//         content.classList.add('fade-out');
        
//         // Wait for animation to complete
//         setTimeout(() => {
//             modal.style.display = 'none';
//             document.body.style.overflow = ''; // Restore scrolling
//             content.classList.remove('fade-out');
            
//             // Restore original URL if we're on an article page
//             if (window.location.pathname.includes('/article/')) {
//                 // Get the current page name (e.g., news.html)
//                 const currentPage = document.title.includes('News') ? 'news.html' : 'index.html';
//                 window.history.pushState({}, document.title, currentPage);
//             }
//         }, 300); // Match animation duration
//     }
// }

// // Update navigation buttons
// function updateNavigationButtons(currentArticleId) {
//     const articles = getNewsArticles();
//     const currentIndex = articles.findIndex(article => article.id === currentArticleId);
    
//     const prevButton = document.querySelector('.prev-article');
//     const nextButton = document.querySelector('.next-article');
    
//     // Update previous button
//     if (currentIndex > 0) {
//         prevButton.disabled = false;
//         prevButton.classList.remove('disabled');
//     } else {
//         prevButton.disabled = true;
//         prevButton.classList.add('disabled');
//     }
    
//     // Update next button
//     if (currentIndex < articles.length - 1) {
//         nextButton.disabled = false;
//         nextButton.classList.remove('disabled');
//     } else {
//         nextButton.disabled = true;
//         nextButton.classList.add('disabled');
//     }
// }

// // Navigate to previous or next article
// function navigateArticle(direction) {
//     // Get current article ID from URL
//     const urlPath = window.location.pathname;
//     const articleMatch = urlPath.match(/\/article\/([a-z0-9-]+)/);
    
//     if (!articleMatch) return;
    
//     // Find current article
//     const articles = getNewsArticles();
//     let currentArticle;
    
//     // Try to find by slug first
//     const slug = articleMatch[1];
//     currentArticle = articles.find(article => generateSlug(article.title) === slug);
    
//     // If not found by slug, try by ID (for backward compatibility)
//     if (!currentArticle && !isNaN(slug)) {
//         const id = parseInt(slug);
//         currentArticle = articles.find(article => article.id === id);
//     }
    
//     if (!currentArticle) return;
    
//     // Find current index
//     const currentIndex = articles.findIndex(article => article.id === currentArticle.id);
    
//     // Calculate target index
//     let targetIndex;
//     if (direction === 'prev') {
//         targetIndex = Math.max(0, currentIndex - 1);
//     } else {
//         targetIndex = Math.min(articles.length - 1, currentIndex + 1);
//     }
    
//     // Open target article if different from current
//     if (targetIndex !== currentIndex) {
//         openArticleViewer(articles[targetIndex].id);
//     }
// }

// // Get article by ID
// function getArticleById(id) {
//     const articles = getNewsArticles();
//     return articles.find(article => article.id === id);
// }

// // Format date for display
// function formatDate(date) {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return date.toLocaleDateString('en-US', options);
// }

// // Generate article content with more realistic content
// function generateArticleContent(article) {
//     // Generate content based on article category and title
//     let content = `
//         <p>${article.summary}</p>
//     `;
    
//     // Add category-specific content
//     if (article.subcategory.toLowerCase().includes('environment')) {
//         content += `
//             <p>Environmental monitoring has become increasingly important in today's world as we face unprecedented challenges from climate change and human activities. The latest satellite imagery provides valuable insights into how our planet's ecosystems are changing over time.</p>
            
//             <h3>Key Findings</h3>
//             <p>Analysis of the most recent data reveals several important trends:</p>
//             <ul>
//                 <li>Forest cover in tropical regions has decreased by approximately 4.2% since 2020</li>
//                 <li>Recovery efforts in previously deforested areas show promising results, with a 2.1% increase in secondary forest growth</li>
//                 <li>Changes in precipitation patterns are affecting vegetation health in subtropical regions</li>
//             </ul>
            
//             <p>These findings highlight the need for continued monitoring and conservation efforts to protect our planet's vital ecosystems.</p>
            
//             <h3>Technological Advancements</h3>
//             <p>Recent improvements in satellite technology have enabled researchers to capture more detailed and frequent observations. The latest generation of Earth observation satellites can provide imagery with resolution down to 30cm, allowing for unprecedented detail in monitoring forest changes.</p>
            
//             <p>Machine learning algorithms are now being employed to automatically detect changes in forest cover, significantly reducing the time required for analysis and enabling near real-time monitoring of critical areas.</p>
            
//             <h3>Implications for Policy</h3>
//             <p>The data gathered from these observations is proving invaluable for policymakers and conservation organizations. By identifying areas of rapid deforestation, resources can be directed more effectively to combat illegal logging and land clearing activities.</p>
            
//             <p>Several countries have already begun implementing new policies based on this satellite data, including stricter enforcement of protected area boundaries and incentives for reforestation projects.</p>
//         `;
//     } else if (article.subcategory.toLowerCase().includes('technology')) {
//         content += `
//             <p>The field of geospatial technology continues to evolve rapidly, with new innovations transforming how we understand and interact with our urban environments. LiDAR (Light Detection and Ranging) technology in particular has seen remarkable advancements in recent years.</p>
            
//             <h3>Urban Planning Applications</h3>
//             <p>Modern LiDAR systems can now create highly detailed 3D models of urban environments with unprecedented accuracy. These models are being used to:</p>
//             <ul>
//                 <li>Simulate traffic flow and pedestrian movement</li>
//                 <li>Analyze solar potential for renewable energy planning</li>
//                 <li>Assess flood risks and develop mitigation strategies</li>
//                 <li>Plan infrastructure development with minimal environmental impact</li>
//             </ul>
            
//             <p>The integration of LiDAR data with other geospatial information systems has created powerful new tools for urban planners and architects.</p>
            
//             <h3>Technical Improvements</h3>
//             <p>Recent technical advancements have significantly improved both the accuracy and efficiency of LiDAR systems:</p>
//             <ul>
//                 <li>Point cloud density has increased from 10 points/m² to over 100 points/m²</li>
//                 <li>Processing algorithms can now automatically classify objects with 95% accuracy</li>
//                 <li>Mobile LiDAR systems have become more compact and energy-efficient</li>
//                 <li>Integration with RGB cameras provides colorized point clouds for easier interpretation</li>
//             </ul>
            
//             <h3>Future Directions</h3>
//             <p>The next generation of LiDAR technology is expected to incorporate quantum sensors, potentially increasing sensitivity by an order of magnitude. This could enable detailed mapping of underground infrastructure and more precise monitoring of structural health in buildings and bridges.</p>
            
//             <p>As costs continue to decrease and processing becomes more automated, we can expect to see LiDAR technology becoming a standard component in smart city initiatives worldwide.</p>
//         `;
//     } else if (article.subcategory.toLowerCase().includes('gis')) {
//         content += `
//             <p>Geographic Information Systems (GIS) have long been essential tools for humanitarian organizations, but recent developments in open-source solutions are democratizing access to these powerful capabilities.</p>
            
//             <h3>Humanitarian Applications</h3>
//             <p>Open-source GIS tools are being deployed in various humanitarian contexts:</p>
//             <ul>
//                 <li>Disaster response coordination during earthquakes, floods, and hurricanes</li>
//                 <li>Refugee camp planning and management</li>
//                 <li>Disease outbreak tracking and resource allocation</li>
//                 <li>Food security monitoring in vulnerable regions</li>
//             </ul>
            
//             <p>These applications are helping organizations respond more effectively to crises and better serve affected populations.</p>
            
//             <h3>Key Open-Source Solutions</h3>
//             <p>Several open-source platforms have emerged as leaders in the humanitarian GIS space:</p>
//             <ul>
//                 <li><strong>QGIS</strong> - A full-featured desktop GIS with extensive plugin ecosystem</li>
//                 <li><strong>OpenStreetMap</strong> - Collaborative mapping platform with global coverage</li>
//                 <li><strong>GeoNode</strong> - Web-based platform for developing geospatial information systems</li>
//                 <li><strong>Ushahidi</strong> - Crisis mapping and citizen reporting platform</li>
//             </ul>
            
//             <p>These tools are being continuously improved by a global community of developers, many of whom are directly involved in humanitarian work.</p>
            
//             <h3>Training and Capacity Building</h3>
//             <p>A key advantage of open-source solutions is the ability to build local capacity. Several organizations now offer training programs specifically designed for humanitarian workers in developing regions, ensuring that GIS expertise remains available even after international aid organizations depart.</p>
            
//             <p>Online learning platforms and community support forums have further democratized access to GIS knowledge, allowing users to troubleshoot problems and share best practices.</p>
//         `;
//     } else if (article.subcategory.toLowerCase().includes('remote sensing')) {
//         content += `
//             <p>Archaeological research has been transformed by the integration of drone mapping technologies, allowing researchers to discover and document sites that were previously inaccessible or unknown.</p>
            
//             <h3>Revolutionary Discoveries</h3>
//             <p>In recent years, drone-based remote sensing has led to several significant archaeological discoveries:</p>
//             <ul>
//                 <li>Previously unknown settlement patterns in densely forested regions of Central America</li>
//                 <li>Detailed mapping of ancient irrigation systems in arid regions of the Middle East</li>
//                 <li>Discovery of buried structures using thermal imaging in European archaeological sites</li>
//                 <li>Documentation of coastal sites threatened by rising sea levels</li>
//             </ul>
            
//             <p>These discoveries are reshaping our understanding of ancient civilizations and their relationship with the environment.</p>
            
//             <h3>Technical Approaches</h3>
//             <p>Archaeologists are employing various remote sensing techniques via drones:</p>
//             <ul>
//                 <li><strong>Photogrammetry</strong> - Creating detailed 3D models from overlapping photographs</li>
//                 <li><strong>LiDAR</strong> - Penetrating vegetation to reveal ground features</li>
//                 <li><strong>Multispectral imaging</strong> - Identifying subtle differences in vegetation that may indicate buried features</li>
//                 <li><strong>Thermal imaging</strong> - Detecting temperature differences that can reveal subsurface structures</li>
//             </ul>
            
//             <p>The combination of these techniques provides archaeologists with unprecedented insights into ancient landscapes.</p>
            
//             <h3>Preservation Efforts</h3>
//             <p>Beyond discovery, drone mapping is playing a crucial role in preservation. Sites threatened by development, looting, or natural disasters can be thoroughly documented, creating detailed digital records for future generations even if the physical sites are damaged or destroyed.</p>
            
//             <p>Several international initiatives are now underway to systematically document at-risk heritage sites using drone technology, creating a digital archive of our shared cultural heritage.</p>
//         `;
//     } else {
//         // Default content for other categories
//         content += `
//             <p>The field of geomatics continues to evolve rapidly, with new technologies and methodologies emerging to address complex challenges in spatial data analysis and visualization.</p>
            
//             <h3>Key Developments</h3>
//             <p>Recent advancements in the field have focused on several key areas:</p>
//             <ul>
//                 <li>Integration of artificial intelligence with geospatial analysis</li>
//                 <li>Improved data collection methodologies for field surveys</li>
//                 <li>Enhanced visualization techniques for complex spatial datasets</li>
//                 <li>Development of real-time monitoring systems for environmental changes</li>
//             </ul>
            
//             <p>These developments are creating new opportunities for professionals in the geomatics field and enabling more sophisticated analysis of spatial phenomena.</p>
            
//             <h3>Practical Applications</h3>
//             <p>The practical applications of these advancements are diverse and far-reaching:</p>
//             <ul>
//                 <li>Urban planning and smart city initiatives</li>
//                 <li>Natural resource management and conservation</li>
//                 <li>Infrastructure development and maintenance</li>
//                 <li>Emergency response and disaster management</li>
//             </ul>
            
//             <p>By providing more accurate and timely spatial information, these technologies are helping decision-makers address complex challenges more effectively.</p>
            
//             <h3>Future Outlook</h3>
//             <p>Looking ahead, we can expect to see continued integration of geomatics with other fields such as computer science, environmental science, and urban studies. This interdisciplinary approach will likely yield new insights and methodologies that further enhance our ability to understand and manage spatial phenomena.</p>
            
//             <p>As data collection becomes more automated and analysis more sophisticated, the role of geomatics professionals will increasingly focus on interpretation and decision support rather than technical data processing.</p>
//         `;
//     }
    
//     // Add related articles section
//     content += `
//         <h3>Related Articles</h3>
//         <div class="related-articles">
//             ${getRelatedArticles(article.id, article.subcategory).map(relatedArticle => `
//                 <div class="related-article">
//                     <h4><a href="javascript:void(0);" onclick="openArticleViewer(${relatedArticle.id})">${relatedArticle.title}</a></h4>
//                     <span class="related-date">${formatDate(new Date(relatedArticle.date))}</span>
//                 </div>
//             `).join('')}
//         </div>
//     `;
    
//     return content;
// }

// // Get related articles
// function getRelatedArticles(currentId, category) {
//     const articles = getNewsArticles();
    
//     // Filter articles by category and exclude current article
//     const relatedArticles = articles
//         .filter(article => article.id !== currentId && 
//                 (article.subcategory === category || article.category === category))
//         .slice(0, 3); // Limit to 3 related articles
    
//     // If not enough related articles by category, add some recent ones
//     if (relatedArticles.length < 3) {
//         const recentArticles = articles
//             .filter(article => article.id !== currentId && !relatedArticles.includes(article))
//             .sort((a, b) => new Date(b.date) - new Date(a.date))
//             .slice(0, 3 - relatedArticles.length);
        
//         relatedArticles.push(...recentArticles);
//     }
    
//     return relatedArticles;
// }

// document.addEventListener('DOMContentLoaded', () => {
//     const modal = new bootstrap.Modal(document.getElementById('articleModal'));
//     const modalTitle = document.getElementById('articleModalLabel');
//     const modalContent = document.getElementById('articleContent');

//     // Fetch full article by ID
//     const fetchFullArticle = async (articleId) => {
//         try {
//             const response = await fetch(`/api/articles/${articleId}`); // Adjust to your API endpoint
//             if (!response.ok) throw new Error('Article not found');
//             const article = await response.json();
//             return article;
//         } catch (error) {
//             console.error('Error fetching full article:', error);
//             return null;
//         }
//     };

//     // Handle button click
//     document.addEventListener('click', async (event) => {
//         if (event.target.classList.contains('read-full-article')) {
//             const articleId = event.target.getAttribute('data-article-id');
//             if (!articleId) {
//                 console.error('No article ID found');
//                 return;
//             }

//             const article = await fetchFullArticle(articleId);
//             if (article) {
//                 modalTitle.textContent = article.title;
//                 modalContent.textContent = article.fullContent || 'No content available';
//                 modal.show();
//             } else {
//                 modalTitle.textContent = 'Error';
//                 modalContent.textContent = 'Failed to load article. Please try again.';
//                 modal.show();
//             }
//         }
//     });
// });
// // Generate article tags
// function generateArticleTags(article) {
//     // Generate tags based on article data
//     const tags = [article.category, article.subcategory];
    
//     // Add additional tags based on content
//     if (article.title.toLowerCase().includes('satellite')) tags.push('Satellite');
//     if (article.title.toLowerCase().includes('drone')) tags.push('Drone');
//     if (article.title.toLowerCase().includes('gis')) tags.push('GIS');
//     if (article.title.toLowerCase().includes('mapping')) tags.push('Mapping');
//     if (article.title.toLowerCase().includes('lidar')) tags.push('LiDAR');
//     if (article.title.toLowerCase().includes('remote')) tags.push('Remote Sensing');
//     if (article.title.toLowerCase().includes('urban')) tags.push('Urban Planning');
//     if (article.title.toLowerCase().includes('environment')) tags.push('Environment');
//     if (article.title.toLowerCase().includes('climate')) tags.push('Climate');
    
//     // Remove duplicates and filter out empty tags
//     const uniqueTags = [...new Set(tags)].filter(tag => tag && tag.trim() !== '');
    
//     // Generate HTML
//     return uniqueTags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
// }

// // Update share links
// function updateShareLinks(modal, article) {
//     const title = encodeURIComponent(article.title);
//     const url = encodeURIComponent(window.location.href);
    
//     const twitterLink = modal.querySelector('.share-twitter');
//     twitterLink.href = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    
//     const facebookLink = modal.querySelector('.share-facebook');
//     facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
//     const linkedinLink = modal.querySelector('.share-linkedin');
//     linkedinLink.href = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
    
//     const emailLink = modal.querySelector('.share-email');
//     emailLink.href = `mailto:?subject=${title}&body=Check out this article: ${url}`;
// }

// // Track article view (simulated)
// function trackArticleView(articleId) {
//     console.log(`Article view tracked: ${articleId}`);
//     // In a real app, this would send data to analytics
// }

// // Add CSS for animations
// document.addEventListener('DOMContentLoaded', function() {
//     // Add CSS if not already present
//     if (!document.getElementById('article-viewer-animations')) {
//         const style = document.createElement('style');
//         style.id = 'article-viewer-animations';
//         style.textContent = `
//             .article-viewer-modal {
//                 transition: opacity 0.3s ease;
//             }
            
//             .article-viewer-content {
//                 transition: transform 0.3s ease, opacity 0.3s ease;
//             }
            
//             .fade-in {
//                 animation: fadeIn 0.3s ease forwards;
//             }
            
//             .fade-out {
//                 animation: fadeOut 0.3s ease forwards;
//             }
            
//             @keyframes fadeIn {
//                 from {
//                     opacity: 0;
//                     transform: translateY(20px);
//                 }
//                 to {
//                     opacity: 1;
//                     transform: translateY(0);
//                 }
//             }
            
//             @keyframes fadeOut {
//                 from {
//                     opacity: 1;
//                     transform: translateY(0);
//                 }
//                 to {
//                     opacity: 0;
//                     transform: translateY(20px);
//                 }
//             }
            
//             .article-navigation {
//                 display: flex;
//                 justify-content: space-between;
//                 margin-top: 20px;
//             }
            
//             .prev-article, .next-article {
//                 background-color: #1a3263;
//                 color: white;
//                 border: none;
//                 padding: 8px 15px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 transition: all 0.3s ease;
//             }
            
//             .prev-article:hover, .next-article:hover {
//                 background-color: #e74c3c;
//             }
            
//             .prev-article.disabled, .next-article.disabled {
//                 background-color: #ccc;
//                 cursor: not-allowed;
//             }
            
//             .related-articles {
//                 display: grid;
//                 grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
//                 gap: 15px;
//                 margin-top: 15px;
//             }
            
//             .related-article {
//                 background-color: #f5f5f5;
//                 padding: 15px;
//                 border-radius: 5px;
//                 transition: transform 0.3s ease, box-shadow 0.3s ease;
//             }
            
//             .related-article:hover {
//                 transform: translateY(-5px);
//                 box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
//             }
            
//             .related-article h4 {
//                 margin-top: 0;
//                 margin-bottom: 5px;
//             }
            
//             .related-date {
//                 font-size: 0.8em;
//                 color: #666;
//             }
//         `;
//         document.head.appendChild(style);
//     }
// });
