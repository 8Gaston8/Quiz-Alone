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

function trackQuizScreenView(screenName, introVersion = null) {
    mixpanel.track('indirectQuiz_screen_viewed', {
        screen_name: screenName,
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion),
        intro_version: introVersion
    });
}

function trackQuizCheckout(variant, checkoutPrice) {
    const screen = CHECKOUT_SCREENS[variant];
    mixpanel.track('indirectQuiz_Checkout', {
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion),
        checkout_price: checkoutPrice,
        trial_status: screen.trial_status,
        checkout_medium: screen.checkout_medium
    });
}

// Initialize tracking when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a tiny bit to ensure intro screen is initialized
    setTimeout(() => {
        const selectedIntro = selectRandomIntroScreen();
        trackQuizScreenView('welcome_screen', selectedIntro.title);
    }, 0);
}); 