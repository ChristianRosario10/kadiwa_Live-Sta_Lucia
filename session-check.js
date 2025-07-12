// Session Management Script
// This script handles admin session checking and auto-logout

// Check admin session on page load
function checkAdminSession() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (isLoggedIn) {
        // Check session timeout (8 hours)
        const currentTime = Date.now();
        const loginTimestamp = parseInt(loginTime) || 0;
        const sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        
        if (currentTime - loginTimestamp > sessionTimeout) {
            console.log('⏰ Admin session expired, logging out...');
            clearAdminSession();
            return;
        }

        // Update login time to extend session
        sessionStorage.setItem('adminLoginTime', currentTime.toString());
        console.log('✅ Admin session active');
    }
}

// Clear admin session
function clearAdminSession() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoginTime');
    console.log('🧹 Admin session cleared');
    
    // Show notification to user about session expiration
    showSessionExpiredMessage();
    
    // Redirect to main dashboard after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Add page visibility change listener
function setupSessionMonitoring() {
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('📄 Page hidden, session will be checked on return');
        } else {
            // Check session when page becomes visible again
            const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
            if (isLoggedIn) {
                const currentTime = Date.now();
                const loginTimestamp = parseInt(sessionStorage.getItem('adminLoginTime')) || 0;
                const sessionTimeout = 8 * 60 * 60 * 1000;
                
                if (currentTime - loginTimestamp > sessionTimeout) {
                    console.log('⏰ Session expired while page was hidden, logging out...');
                    clearAdminSession();
                    // Show notification to user
                    showSessionExpiredMessage();
                }
            }
        }
    });

    // Add beforeunload listener to clear session if user closes tab/window
    window.addEventListener('beforeunload', function() {
        console.log('🚪 User leaving page');
        // Don't clear session on page unload, let it timeout naturally
    });
}

// Show session expired message
function showSessionExpiredMessage() {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">⏰</span>
            <div>
                <strong>Session Expired</strong><br>
                Your admin session has expired. You will be redirected to the main dashboard in 2 seconds.
            </div>
        </div>
    `;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Initialize session checking
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Checking admin session...');
    checkAdminSession();
    setupSessionMonitoring();
});

// Export functions for use in other scripts
window.clearAdminSession = clearAdminSession;
window.checkAdminSession = checkAdminSession; 