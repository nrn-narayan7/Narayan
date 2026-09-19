// Contact Form JavaScript for Narayan Tripathi's Website - Improved Version

document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact form if present
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        setupContactForm();
    }
    
    // Hide empty validation message boxes initially
    hideEmptyValidationBoxes();
});

// Hide empty validation message boxes
function hideEmptyValidationBoxes() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(element => {
        if (element.textContent.trim() === '') {
            element.style.display = 'none';
        }
    });
}

// Setup contact form with validation and direct email functionality
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    
    // Add input event listeners for real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            validateField(this, 'name-error', 'Please enter your name');
        });
        nameInput.addEventListener('blur', function() {
            validateField(this, 'name-error', 'Please enter your name');
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this, 'email-error');
        });
        emailInput.addEventListener('blur', function() {
            validateEmail(this, 'email-error');
        });
    }
    
    if (subjectInput) {
        subjectInput.addEventListener('input', function() {
            validateField(this, 'subject-error', 'Please enter a subject');
        });
        subjectInput.addEventListener('blur', function() {
            validateField(this, 'subject-error', 'Please enter a subject');
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            validateField(this, 'message-error', 'Please enter your message');
        });
        messageInput.addEventListener('blur', function() {
            validateField(this, 'message-error', 'Please enter your message');
        });
    }
    
    // Add focus and blur event listeners for animation
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Form submission handler
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const isNameValid = validateField(nameInput, 'name-error', 'Please enter your name');
        const isEmailValid = validateEmail(emailInput, 'email-error');
        const isSubjectValid = validateField(subjectInput, 'subject-error', 'Please enter a subject');
        const isMessageValid = validateField(messageInput, 'message-error', 'Please enter your message');
        
        // If all fields are valid, submit the form
        if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
            // Show sending status
            formStatus.innerHTML = '<div class="sending-message"><i class="fas fa-spinner fa-spin"></i> Sending your message...</div>';
            
            // Get form data
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectInput.value.trim(),
                message: messageInput.value.trim()
            };
            
            // Send email directly using EmailJS or similar service
            sendEmail(formData);
        } else {
            // Show error message
            formStatus.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Please fill in all required fields correctly.</div>';
            
            // Clear error message after 3 seconds
            setTimeout(() => {
                formStatus.innerHTML = '';
            }, 3000);
        }
    });
}

// Validate a field
function validateField(field, errorId, errorMessage) {
    const errorElement = document.getElementById(errorId);
    
    if (!field || !errorElement) return false;
    
    if (field.value.trim() === '') {
        field.classList.add('error');
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        return false;
    } else {
        field.classList.remove('error');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        return true;
    }
}

// Validate email format
function validateEmail(field, errorId) {
    const errorElement = document.getElementById(errorId);
    
    if (!field || !errorElement) return false;
    
    const email = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
        field.classList.add('error');
        errorElement.textContent = 'Please enter your email address';
        errorElement.style.display = 'block';
        return false;
    } else if (!emailRegex.test(email)) {
        field.classList.add('error');
        errorElement.textContent = 'Please enter a valid email address';
        errorElement.style.display = 'block';
        return false;
    } else {
        field.classList.remove('error');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        return true;
    }
}

// Send email function — delivers to er.narayantripathi@gmail.com via Formspree
// (no backend needed; Formspree just forwards the submission to your inbox)
function sendEmail(formData) {
    const formStatus = document.getElementById('form-status');

    // ⚠️ SETUP REQUIRED — replace this with your own Formspree endpoint:
    // 1. Go to https://formspree.io and sign up free with er.narayantripathi@gmail.com
    // 2. Create a new form — Formspree gives you a URL like https://formspree.io/f/abcdwxyz
    // 3. Paste that URL below, replacing the placeholder
    // 4. Your FIRST real submission will trigger a one-time "confirm your form" email
    //    from Formspree — click confirm, and every submission after that lands in your inbox.
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

    fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            _replyto: formData.email,
            subject: formData.subject,
            _subject: 'Website contact: ' + formData.subject,
            message: formData.message
        })
    })
    .then(response => {
        if (response.ok) {
            formStatus.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Message sent successfully!</div>';
            document.getElementById('contactForm').reset();

            // Reset form input states
            const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
            formInputs.forEach(input => {
                input.parentElement.classList.remove('focused');
            });
        } else {
            return response.json().then(data => {
                const reason = (data && data.errors && data.errors.length)
                    ? data.errors.map(e => e.message).join(', ')
                    : 'Submission failed';
                throw new Error(reason);
            });
        }
    })
    .catch(error => {
        console.error('Contact form error:', error);
        formStatus.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> There was an error sending your message. Please try again later.</div>';
    })
    .finally(() => {
        // Clear status message after 5 seconds
        setTimeout(() => {
            formStatus.innerHTML = '';
        }, 5000);
    });
}
