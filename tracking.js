// Tracking functions for quiz events
function getQuizDescription(quizVersion) {
    switch(quizVersion) {
        case 'Classic_Quiz':
            return "A foundational quiz focused on basic gluten-free dining challenges and safety concerns";
        case 'Lifestyle_Quiz':
            return "An in-depth quiz exploring dining preferences, budget, and lifestyle factors for gluten-free eaters";
        case 'Experience_Quiz':
            return "A personalized quiz examining social aspects and dining experiences of gluten-free individuals";
        case 'Quick_Quiz':
            return "A brief assessment focusing on essential gluten-free dining preferences and safety priorities";
        case 'Extended_Quiz':
            return "A comprehensive exploration of gluten-free dining habits, social situations, and detailed safety considerations";
        default:
            return "General gluten-free dining quiz";
    }
}

function trackQuizScreenView(screenName) {
    mixpanel.track('indirectQuiz_screen_viewed', {
        screen_name: screenName,
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion)
    });
}

function trackQuizCheckout() {
    mixpanel.track('indirectQuiz_Checkout', {
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion)
    });
}

// Initialize tracking when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Track initial landing page view
    trackQuizScreenView('welcome_screen');
}); 