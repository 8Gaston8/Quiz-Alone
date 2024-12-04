// Tracking functions for quiz events
function trackQuizScreenView(screenName) {
    mixpanel.track('indirectQuiz_screen_viewed', {
        screen_name: screenName,
        quiz_version: currentQuizVersion
    });
}

function trackQuizCheckout() {
    mixpanel.track('indirectQuiz_Checkout', {
        quiz_version: currentQuizVersion
    });
}

// Initialize tracking when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Track initial landing page view
    trackQuizScreenView('welcome_screen');
}); 