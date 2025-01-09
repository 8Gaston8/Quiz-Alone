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
        case 'Value_Quiz':
            return "A value-focused quiz highlighting the benefits and features of safe gluten-free dining solutions";
        case 'Discount_Quiz':
            return "A special offer quiz with exclusive limited-time discount for personalized gluten-free dining solutions";
        default:
            return "General gluten-free dining quiz";
    }
}

function trackQuizScreenView(screenName, additionalProps = {}) {
    const urlParams = new URLSearchParams(window.location.search);
    const isTrialFlow = urlParams.get('mode') === 'trial';
    
    mixpanel.track('indirectQuiz_screen_viewed', {
        screen_name: screenName,
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion),
        intro_version: additionalProps.intro_version || additionalProps,
        is_trial_flow: isTrialFlow,
        style_version: 'light',
        hide_page_numbers: hidePageNumbers,
        ...additionalProps
    });
}

function trackQuizCheckout(variant, checkoutPrice) {
    const screen = CHECKOUT_SCREENS[variant] || {};
    // Get progress bar visibility state directly from the DOM
    const progressTracker = document.querySelector('.progress-tracker');
    const progressBarVisible = progressTracker ? progressTracker.style.display === 'block' : false;
    
    mixpanel.track('indirectQuiz_Checkout', {
        quiz_version: currentQuizVersion,
        quiz_description: getQuizDescription(currentQuizVersion),
        checkout_price: checkoutPrice,
        trial_status: screen.trial_status || 'none',
        checkout_medium: screen.checkout_medium || 'direct',
        is_trial_flow: variant === 'TRIAL_CHECKOUT',
        style_version: 'light',
        hide_page_numbers: hidePageNumbers,
        progress_bar_visible: progressBarVisible
    });
}

// Initialize tracking when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a tiny bit to ensure intro screen is initialized
    setTimeout(() => {
        const selectedIntro = selectRandomIntroScreen();
        const progressTracker = document.querySelector('.progress-tracker');
        trackQuizScreenView('welcome_screen', { 
            intro_version: selectedIntro.intro_version,
            progress_bar_visible: progressTracker ? progressTracker.style.display === 'block' : false
        });
    }, 0);
}); 