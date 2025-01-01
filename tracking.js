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
        case 'Aha_Quiz':
            return "An optimized quiz focused on understanding gluten sensitivity impacts and discovering personalized safe dining solutions";
        default:
            return "General gluten-free dining quiz";
    }
}

function trackQuizScreenView(screenName, introVersion = null) {
    const urlParams = new URLSearchParams(window.location.search);
    const isTrialFlow = urlParams.get('mode') === 'trial';
    
    mixpanel.track('indirectQuiz_screen_viewed', {
        screen_name: screenName,
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion),
        intro_version: introVersion,
        is_trial_flow: isTrialFlow,
        style_version: window.selectedStyleVersion || 'dark'
    });
}

function trackQuizCheckout(variant, checkoutPrice) {
    const screen = CHECKOUT_SCREENS[variant];
    mixpanel.track('indirectQuiz_Checkout', {
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion),
        checkout_price: checkoutPrice,
        trial_status: screen.trial_status,
        checkout_medium: screen.checkout_medium,
        is_trial_flow: variant === 'TRIAL_CHECKOUT',
        style_version: window.selectedStyleVersion || 'dark'
    });
}

// Initialize tracking when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a tiny bit to ensure intro screen is initialized
    setTimeout(() => {
        const selectedIntro = selectRandomIntroScreen();
        trackQuizScreenView('welcome_screen', selectedIntro.intro_version);
    }, 0);
}); 