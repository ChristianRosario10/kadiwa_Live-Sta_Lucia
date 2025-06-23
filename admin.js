// Admin Login JavaScript
// Admin Credentials:
// Username: kadiwa_CIS
// Password: k@diwa

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'kadiwa_CIS',
    password: 'k@diwa'
};

// DOM elements
const adminLoginForm = document.getElementById('adminLoginForm');

// Initialize admin login
function initAdminLogin() {
    console.log('🔐 Initializing admin login...');
    console.log('📋 Admin credentials:', ADMIN_CREDENTIALS);
    
    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        console.log('✅ Already logged in, redirecting to admin dashboard...');
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // Check if form exists
    if (!adminLoginForm) {
        console.error('❌ Admin login form not found!');
        return;
    }

    // Event listeners
    adminLoginForm.addEventListener('submit', handleLogin);
    
    console.log('✅ Admin login initialization complete');
    console.log('🔑 Ready for login attempts');
}

// Handle admin login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('🔐 Login attempt started');
    console.log('📝 Input username:', `"${username}"`);
    console.log('📝 Input password:', `"${password}"`);
    console.log('📋 Expected username:', `"${ADMIN_CREDENTIALS.username}"`);
    console.log('📋 Expected password:', `"${ADMIN_CREDENTIALS.password}"`);
    
    // Check for whitespace issues
    const usernameTrimmed = username.trim();
    const passwordTrimmed = password.trim();
    console.log('🧹 Username trimmed:', `"${usernameTrimmed}"`);
    console.log('🧹 Password trimmed:', `"${passwordTrimmed}"`);
    
    // Check exact matches
    const usernameExactMatch = username === ADMIN_CREDENTIALS.username;
    const passwordExactMatch = password === ADMIN_CREDENTIALS.password;
    console.log('✅ Username exact match:', usernameExactMatch);
    console.log('✅ Password exact match:', passwordExactMatch);
    
    // Check trimmed matches
    const usernameTrimmedMatch = usernameTrimmed === ADMIN_CREDENTIALS.username;
    const passwordTrimmedMatch = passwordTrimmed === ADMIN_CREDENTIALS.password;
    console.log('✅ Username trimmed match:', usernameTrimmedMatch);
    console.log('✅ Password trimmed match:', passwordTrimmedMatch);
    
    clearErrors();
    
    // Try exact match first, then trimmed match
    if (usernameExactMatch && passwordExactMatch) {
        console.log('✅ Login successful! Redirecting to admin dashboard...');
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        window.location.href = 'admin-dashboard.html';
    } else if (usernameTrimmedMatch && passwordTrimmedMatch) {
        console.log('✅ Login successful (after trimming)! Redirecting to admin dashboard...');
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        window.location.href = 'admin-dashboard.html';
    } else {
        console.log('❌ Login failed - invalid credentials');
        console.log('❌ No matches found for username or password');
        showError('username', 'Invalid username or password');
        showError('password', 'Invalid username or password');
    }
}

// Show error message
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        console.log(`❌ Error shown for ${fieldId}: ${message}`);
    } else {
        console.error(`❌ Error element not found: ${fieldId}Error`);
    }
}

// Clear error messages
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.classList.remove('show');
    });
    console.log('🧹 Errors cleared');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing admin login...');
    initAdminLogin();
});

// Console message with admin credentials
console.log('🔐 Admin Panel Access:');
console.log('Username: kadiwa_CIS');
console.log('Password: k@diwa');
console.log('Navigate to admin.html to access the admin panel'); 