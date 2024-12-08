console.log('Loading quiz system...');

let quizData = null;
let currentQuizVersion = '';

// Checkout screen configuration
const CHECKOUT_SCREENS = {
    STRIPE_59: {
        url: 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2',
        price: '59.99',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: true
    },
    STRIPE_69: {
        url: 'https://pay.atly.com/b/6oEaIxdSJa0qgYE9AD',
        price: '79.99',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: true
    },
    APP_CHECKOUT: {
        url: 'https://web.steps.me/m/CwX3l0tJjXE',
        price: '',
        checkout_medium: 'app',
        trial_status: 'trial',
        active: false
    },
    TEST_CHECKOUT: {
        url: 'https://pay.atly.com/b/test_4gw7sz7vO2tTerK6oq',
        price: '59.99',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: false
    }
};

function selectRandomQuiz() {
    const versions = ['A', 'B', 'C', 'D', 'E', 'F'];
    const randomIndex = Math.floor(Math.random() * versions.length);
    const selectedVersion = versions[randomIndex];
    console.log('Selected version:', selectedVersion);
    
    switch(selectedVersion) {
        case 'A':
            quizData = quizDataA;
            currentQuizVersion = 'Classic_Quiz';
            break;
        case 'B':
            quizData = quizDataB;
            currentQuizVersion = 'Lifestyle_Quiz';
            break;
        case 'C':
            quizData = quizDataC;
            currentQuizVersion = 'Experience_Quiz';
            break;
        case 'D':
            quizData = quizDataD;
            currentQuizVersion = 'Quick_Quiz';
            break;
        case 'E':
            quizData = quizDataE;
            currentQuizVersion = 'Extended_Quiz';
            break;
        case 'F':
            quizData = quizDataF;
            currentQuizVersion = 'Joshua_e';
            break;
    }
    
    console.log(`Selected quiz version: ${currentQuizVersion}`);
    console.log('Quiz data loaded:', quizData && quizData.length ? 'yes' : 'no');
    return quizData;
}

// Function to randomly select a checkout screen
function selectCheckoutScreen() {
    // Check if we're in test mode via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'test') {
        return {
            url: CHECKOUT_SCREENS.TEST_CHECKOUT.url,
            price: CHECKOUT_SCREENS.TEST_CHECKOUT.price,
            variant: 'TEST_CHECKOUT',
            checkout_medium: CHECKOUT_SCREENS.TEST_CHECKOUT.checkout_medium,
            trial_status: CHECKOUT_SCREENS.TEST_CHECKOUT.trial_status
        };
    }

    const activeVariants = Object.entries(CHECKOUT_SCREENS)
        .filter(([_, config]) => config.active)
        .map(([variant]) => variant);
    
    const randomIndex = Math.floor(Math.random() * activeVariants.length);
    const variant = activeVariants[randomIndex];
    const screen = CHECKOUT_SCREENS[variant];
    
    return {
        url: screen.url,
        price: screen.price,
        variant,
        checkout_medium: screen.checkout_medium,
        trial_status: screen.trial_status
    };
}

// Initialize quiz data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, selecting quiz...');
    selectRandomQuiz();
});

console.log('Quiz data loaded successfully');

// Rest of the quiz logic remains the same... 