const introScreens = [
    {
        emoji: "Hey there! 🥳",
        title: "Find amazing gluten-free spots",
        description: "Let's make dining out fun and stress-free! ✨",
        buttonText: "I'm Ready"
    },
    {
        emoji: "Welcome! 🌟",
        title: "Your Gluten-Free Adventure Starts Here",
        description: "Discover a world of safe and delicious dining! ✨",
        buttonText: "Start Exploring"
    },
    {
        emoji: "Hi Friend! 👋",
        title: "Never Worry About Gluten Again",
        description: "Join thousands finding their perfect spots! ✨",
        buttonText: "Let's Begin"
    },
    {
        emoji: "Greetings! 🌟",
        title: "Your Gluten-Free Guide Awaits",
        description: "Find trusted restaurants that understand you! ✨",
        buttonText: "Show Me Where"
    },
    {
        emoji: "Hello! ⭐️",
        title: "Discover Your New Favorite Places",
        description: "Safe and delicious dining, curated for you! ✨",
        buttonText: "Let's Go"
    }
];

function selectRandomIntroScreen() {
    // Always return the "Never Worry About Gluten Again" intro screen (index 2)
    return introScreens[2];
}

function updateIntroScreen() {
    const selectedIntro = selectRandomIntroScreen();
    
    // Select random quiz version using the same logic as quiz.js
    const versions = ['A', 'B', 'C', 'D', 'F'];
    const randomIndex = Math.floor(Math.random() * versions.length);
    const selectedVersion = versions[randomIndex];
    
    // Map version letter to actual quiz version name
    let selectedQuizVersion;
    switch(selectedVersion) {
        case 'A':
            selectedQuizVersion = 'Classic_Quiz';
            break;
        case 'B':
            selectedQuizVersion = 'Lifestyle_Quiz';
            break;
        case 'C':
            selectedQuizVersion = 'Experience_Quiz';
            break;
        case 'D':
            selectedQuizVersion = 'Quick_Quiz';
            break;
        case 'F':
            selectedQuizVersion = 'Joshua_e';
            break;
    }
    
    // Store the selected version globally
    window.currentQuizVersion = selectedQuizVersion;
    window.selectedQuizLetter = selectedVersion; // Store the letter version for quiz.js to use
    
    // Update DOM elements
    document.getElementById('landing-emoji').textContent = selectedIntro.emoji;
    document.getElementById('landing-title').textContent = selectedIntro.title;
    document.getElementById('landing-description').textContent = selectedIntro.description;
    document.getElementById('start-quiz').textContent = selectedIntro.buttonText;
    
    // Track the intro screen view with mixpanel, now including the correct quiz version
    mixpanel.track('indirectQuiz_screen_viewed', {
        screen_name: 'welcome_screen',
        intro_version: selectedIntro.title,
        quiz_version: selectedQuizVersion,
        quiz_description: getQuizDescription(selectedQuizVersion)
    });
    
    // Select the appropriate quiz data based on version
    switch(selectedQuizVersion) {
        case 'Classic_Quiz':
            window.quizData = quizDataA;
            break;
        case 'Lifestyle_Quiz':
            window.quizData = quizDataB;
            break;
        case 'Experience_Quiz':
            window.quizData = quizDataC;
            break;
        case 'Quick_Quiz':
            window.quizData = quizDataD;
            break;
        case 'Extended_Quiz':
            window.quizData = quizDataE;
            break;
        case 'Focused_Quiz':
            window.quizData = quizDataF;
            break;
    }
}

// Initialize the intro screen when the page loads
document.addEventListener('DOMContentLoaded', updateIntroScreen); 