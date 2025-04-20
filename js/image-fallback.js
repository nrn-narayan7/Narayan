// Image fallback handler
document.addEventListener('DOMContentLoaded', function() {
    // Get all images on the page
    const images = document.querySelectorAll('img');
    
    // Add onerror handler to each image
    images.forEach(img => {
        // Skip images that already have onerror handlers
        if (!img.hasAttribute('onerror')) {
            // Determine appropriate fallback based on image context
            let fallbackImage = 'images/fallback-general.jpg'; // Default fallback
            
            // Check alt text or parent elements to determine context
            const altText = img.alt.toLowerCase();
            const parentText = img.parentElement ? img.parentElement.textContent.toLowerCase() : '';
            
            if (altText.includes('profile') || altText.includes('narayan') || 
                parentText.includes('profile') || parentText.includes('narayan')) {
                fallbackImage = 'images/fallback-profile.jpg';
            } else if (altText.includes('project') || parentText.includes('project')) {
                fallbackImage = 'images/fallback-project.jpg';
            } else if (altText.includes('education') || parentText.includes('education')) {
                fallbackImage = 'images/fallback-education.jpg';
            } else if (altText.includes('news') || parentText.includes('news')) {
                fallbackImage = 'images/fallback-news.jpg';
            }
            
            // Set the onerror handler
            img.onerror = function() {
                this.src = fallbackImage;
                this.onerror = null; // Prevent infinite loop if fallback also fails
            };
        }
    });
});
