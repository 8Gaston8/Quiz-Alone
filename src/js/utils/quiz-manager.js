console.log('Loading quiz system...');

let quizData = null;
let currentQuizVersion = '';
let hidePageNumbers = true;  // Always hide page numbers

// Checkout screen configuration
const CHECKOUT_SCREENS = {
    STRIPE_39: {
        url: 'https://pay.atly.com/b/eVabMB01Tc8ydMsfZ8',
        price: '39.99 noTrial',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: true
    },
    STRIPE_49: {
        url: 'https://pay.atly.com/b/cN22c1g0R3C2fUA009',
        price: '49.99 noTrial',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: true
    },
    STRIPE_59: {
        url: 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2',
        price: '59.99 noTrial',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: true
    },
    STRIPE_69: {
        url: 'https://pay.atly.com/b/6oEaIxdSJa0qgYE9AD',
        price: '79.99 noTrial',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: true
    },
    APP_CHECKOUT: {
        url: 'https://web.steps.me/m/CwX3l0tJjXE',
        price: 'in-app price',
        checkout_medium: 'app',
        trial_status: 'trial',
        active: false
    },
    TEST_CHECKOUT: {
        url: 'https://pay.atly.com/b/test_4gw7sz7vO2tTerK6oq',
        price: '59.99 noTrial',
        checkout_medium: 'web',
        trial_status: 'no-trial',
        active: false
    },
    TRIAL_CHECKOUT: {
        url: 'https://pay.atly.com/b/fZebMB4i93C2dMs4gg',
        price: '99.99 trial',
        checkout_medium: 'web',
        trial_status: 'trial',
        active: false
    },
    TRIAL_CHECKOUT_B: {
        url: 'https://pay.atly.com/b/bIY03T4i9a0q8s86oB',
        price: '99.99 trial (1 day)',
        checkout_medium: 'web',
        trial_status: 'trial',
        active: false
    },
    TRIAL_3_DAYS: {
        url: 'https://pay.atly.com/b/cN25odeWNb4u5fWdR4',
        price: '99.99 trial (3 days)',
        checkout_medium: 'web',
        trial_status: 'trial',
        active: false
    },
    TRIAL_14_DAYS: {
        url: 'https://pay.atly.com/b/cN29EtbKBdcCeQwdR5',
        price: '99.99 trial (14 days)',
        checkout_medium: 'web',
        trial_status: 'trial',
        active: false
    },
    TRIAL_30_DAYS: {
        url: 'https://pay.atly.com/b/7sI4k94i9goO4bS28o',
        price: '99.99 trial (30 days)',
        checkout_medium: 'web',
        trial_status: 'trial',
        active: false
    }
};

function selectRandomQuiz() {
    // Use the version selected by intro_screens.js if available, otherwise select randomly
    let selectedVersion;
    if (window.selectedQuizLetter) {
        selectedVersion = window.selectedQuizLetter;
        console.log('Using version selected by intro screen:', selectedVersion);
    } else {
        const versions = ['G', 'H', 'I', 'J'];  // Keep version J in random selection
        const randomIndex = Math.floor(Math.random() * versions.length);
        selectedVersion = versions[randomIndex];
        console.log('Selected random version:', selectedVersion);
    }
    
    // Ensure quiz data is loaded for version J
    if (selectedVersion === 'J' && typeof quizDataJ === 'undefined') {
        console.error('Quiz data J not loaded');
        return null;
    }
    
    switch(selectedVersion) {
        case 'A':
            quizData = quizDataA;
            currentQuizVersion = 'Classic_Quiz';
            break;
        case 'C':
            quizData = quizDataC;
            currentQuizVersion = 'Experience_Quiz';
            break;
        case 'D':
            quizData = quizDataD;
            currentQuizVersion = 'Quick_Quiz';
            break;
        case 'G':
            quizData = quizDataG;
            currentQuizVersion = 'Aha_Quiz';
            break;
        case 'H':
            quizData = quizDataH;
            currentQuizVersion = 'Value_Quiz';
            break;
        case 'I':
            quizData = quizDataI;
            currentQuizVersion = 'Discount_Quiz';
            break;
        case 'J':
            quizData = quizDataJ;
            currentQuizVersion = 'City_Quiz';
            document.body.setAttribute('data-quiz-version', 'City_Quiz');
            break;
    }
    
    // Store the selected version globally
    window.selectedQuizLetter = selectedVersion;
    window.currentQuizVersion = currentQuizVersion;
    
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

    // Check if we're in trial mode via URL parameter
    if (urlParams.get('mode') === 'trial') {
        // Get all available trial checkout options
        const trialOptions = [
            CHECKOUT_SCREENS.TRIAL_CHECKOUT,
            CHECKOUT_SCREENS.TRIAL_CHECKOUT_B,
            CHECKOUT_SCREENS.TRIAL_3_DAYS,
            CHECKOUT_SCREENS.TRIAL_14_DAYS,
            CHECKOUT_SCREENS.TRIAL_30_DAYS
        ];
        
        // Randomly select one of the trial options
        const selectedTrial = trialOptions[Math.floor(Math.random() * trialOptions.length)];
        return {
            url: selectedTrial.url,
            price: selectedTrial.price,
            variant: Object.keys(CHECKOUT_SCREENS).find(key => CHECKOUT_SCREENS[key] === selectedTrial),
            checkout_medium: selectedTrial.checkout_medium,
            trial_status: selectedTrial.trial_status
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
    console.log('DOM loaded, selecting quiz version...');
    // Only select the quiz version, don't load the question yet
    selectRandomQuiz();
    console.log('Quiz version selected');
    // Dispatch event when quiz manager is done initializing
    window.dispatchEvent(new Event('quizManagerReady'));
});

console.log('Quiz manager loaded successfully');

// Remove the displayQuestion function since it's handled in script.js 