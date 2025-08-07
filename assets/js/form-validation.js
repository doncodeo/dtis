// Form Validation Utilities
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    // At least 8 characters, one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
}

function validatePhone(phone) {
    // Basic international phone number validation
    const re = /^\+?[\d\s\-\(\)]{7,}$/;
    return re.test(phone);
}

function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function setupFormValidation(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        let isValid = true;
        const errors = {};
        
        // Validate each field
        Object.keys(rules).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) return;
            
            const value = field.value.trim();
            const fieldRules = rules[fieldName];
            
            // Required validation
            if (fieldRules.required && !value) {
                errors[fieldName] = fieldRules.requiredMessage || 'This field is required';
                isValid = false;
                return;
            }
            
            // Type validation
            if (value) {
                if (fieldRules.type === 'email' && !validateEmail(value)) {
                    errors[fieldName] = 'Please enter a valid email address';
                    isValid = false;
                } else if (fieldRules.type === 'password' && !validatePassword(value)) {
                    errors[fieldName] = 'Password must be at least 8 characters with at least one letter and one number';
                    isValid = false;
                } else if (fieldRules.type === 'phone' && !validatePhone(value)) {
                    errors[fieldName] = 'Please enter a valid phone number';
                    isValid = false;
                } else if (fieldRules.type === 'url' && !validateURL(value)) {
                    errors[fieldName] = 'Please enter a valid URL';
                    isValid = false;
                }
                
                // Custom validation
                if (fieldRules.validate && !fieldRules.validate(value)) {
                    errors[fieldName] = fieldRules.validateMessage || 'Invalid value';
                    isValid = false;
                }
            }
        });
        
        // Confirm password validation
        if (rules.password && rules.confirmPassword) {
            const password = form.querySelector('[name="password"]').value;
            const confirmPassword = form.querySelector('[name="confirmPassword"]').value;
            
            if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
                isValid = false;
            }
        }
        
        if (!isValid) {
            e.preventDefault();
            
            // Display errors
            Object.keys(errors).forEach(fieldName => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (!field) return;
                
                let errorElement = field.nextElementSibling;
                if (!errorElement || !errorElement.classList.contains('error-message')) {
                    errorElement = document.createElement('div');
                    errorElement.className = 'error-message text-danger mt-1';
                    field.parentNode.appendChild(errorElement);
                }
                
                errorElement.textContent = errors[fieldName];
                field.classList.add('is-invalid');
            });
        }
    });
    
    // Clear errors on input
    form.addEventListener('input', function(e) {
        if (e.target.name && rules[e.target.name]) {
            const field = e.target;
            field.classList.remove('is-invalid');
            
            const errorElement = field.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
        }
    });
}