const introScreens = [
    {
        emoji: "",
        title: "Find 100% safe gluten-free restaurants",
        description: "A streamlined quiz experience with modern design, focused on quick and reliable gluten-free dining solutions",
        buttonText: "DISCOVER SPOTS",
        isModern: true,
        badges: [
            "GLUTENED-FREE GUARANTEE",
            "#1 DIETITIANS CHOICE",
            "MOST RELIABLE CELIAC MAP"
        ]
    }
];

function selectRandomIntroScreen() {
    // Randomly select one of the modern intro screens
    const randomIndex = Math.floor(Math.random() * introScreens.length);
    const modernScreen = {...introScreens[randomIndex]};
    
    // Generate random number between 200 and 350
    const randomNumber = Math.floor(Math.random() * (350 - 200 + 1) + 200);
    modernScreen.description = `${randomNumber}+ people joined today 👇`;
    modernScreen.intro_version = `modern_${modernScreen.buttonText.toLowerCase().replace(/\s+/g, '_')}`; // Use button text for tracking
    return modernScreen;
}

function updateIntroScreen() {
    const selectedIntro = selectRandomIntroScreen();
    
    // Handle modern CSS file
    const modernCssId = 'modern-intro-css';
    let modernCssLink = document.getElementById(modernCssId);
    
    // Select random quiz version using the same logic as quiz.js
    const versions = ['A', 'C', 'D', 'G', 'H'];  // Only keeping classic, experience, quick, aha, and value quizzes
    const randomIndex = Math.floor(Math.random() * versions.length);
    const selectedVersion = versions[randomIndex];

    // Select style version if not already selected
    if (!window.selectedStyleVersion) {
        window.selectedStyleVersion = 'light';
        // Store the style version in localStorage
        localStorage.setItem('style_version', 'light');
    }
    
    // Remove any existing main stylesheets first
    const existingStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    existingStylesheets.forEach(sheet => {
        if (sheet.href.includes('light_styles.css') || sheet.href.includes('styles.css')) {
            sheet.remove();
        }
    });
    
    // Apply the light style
    const styleLink = document.createElement('link');
    styleLink.id = 'main-stylesheet';
    styleLink.rel = 'stylesheet';
    styleLink.href = '/light_styles.css';
    document.head.appendChild(styleLink);
    
    // Map version letter to actual quiz version name
    let selectedQuizVersion;
    switch(selectedVersion) {
        case 'A':
            selectedQuizVersion = 'Classic_Quiz';
            break;
        case 'C':
            selectedQuizVersion = 'Experience_Quiz';
            break;
        case 'D':
            selectedQuizVersion = 'Quick_Quiz';
            break;
        case 'G':
            selectedQuizVersion = 'Aha_Quiz';
            break;
        case 'H':
            selectedQuizVersion = 'Value_Quiz';
            break;
    }
    
    // Store the selected version globally
    window.currentQuizVersion = selectedQuizVersion;
    window.selectedQuizLetter = selectedVersion; // Store the letter version for quiz.js to use
    
    // Set the quiz version attribute on the body element
    document.body.setAttribute('data-quiz-version', selectedQuizVersion);
    
    if (selectedIntro.isModern) {
        if (!modernCssLink) {
            modernCssLink = document.createElement('link');
            modernCssLink.id = modernCssId;
            modernCssLink.rel = 'stylesheet';
            modernCssLink.href = '/modern-intro.css';
            document.head.appendChild(modernCssLink);
        }
        document.body.classList.add('modern-intro');
        
        // Set the title in the DOM
        document.getElementById('landing-title').textContent = selectedIntro.title;
        
        // Create the landing content with badges and dynamic user count
        const landingContent = document.querySelector('.landing-content');
        landingContent.innerHTML = `
            <div class="content">
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 42 763.09 233.36" width="82" height="25.11518304" class="logo">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M53.5385 42C23.97 42 0 65.97 0 95.5385V220.462C0 250.03 23.97 274 53.5385 274H178.462C208.03 274 232 250.03 232 220.462V95.5385C232 65.97 208.03 42 178.462 42H53.5385ZM65.1673 194.281C37.1693 166.283 37.1693 120.889 65.1673 92.8911C93.1654 64.8931 138.559 64.8931 166.557 92.8911C194.555 120.889 194.555 166.283 166.557 194.281L116.886 243.952C116.321 244.517 115.404 244.517 114.838 243.952L65.1673 194.281ZM80.0236 177.377C80.0236 178.513 80.9447 179.434 82.0808 179.434H115.87C135.668 179.434 151.717 163.385 151.717 143.587C151.717 123.79 135.668 107.741 115.87 107.741C96.0728 107.741 80.0237 123.79 80.0237 143.587L80.0236 177.377Z" fill="white"/>
                    <path d="M393.76 105.728C382.104 95.56 366.976 89.36 349.616 89.36C309.44 89.36 279.432 119.616 279.432 160.04C279.432 200.464 309.44 230.968 349.616 230.968C366.728 230.968 381.608 225.016 393.016 214.848L396.24 227H424.512V93.08H397.48L393.76 105.728ZM352.592 196.744C331.512 196.744 316.136 180.872 316.136 160.04C316.136 138.96 331.512 123.336 352.592 123.336C373.672 123.336 389.048 138.96 389.048 160.04C389.048 181.12 373.672 196.744 352.592 196.744ZM520.099 194.76C506.707 194.76 499.267 187.32 499.267 174.424V122.344H535.723V93.328H498.771V58.36H491.827L439.003 114.408V122.344H463.059V179.384C463.059 209.144 481.163 227.248 510.675 227.248H536.467V195.008L520.099 194.76ZM597.397 227V44.968H561.189V227H597.397ZM691.174 175.664L655.462 93.328H616.03L672.822 216.832L672.326 217.824C664.142 238.16 659.678 242.872 642.07 242.872H629.67V275.36H644.55C674.558 275.36 688.694 261.72 704.814 225.264L763.094 93.08H724.654L691.174 175.664Z" fill="white"/>
                </svg>
                
                <div class="intro-container">
                    <div class="hero-section">
                        <div class="text-content">
                            <h1 id="landing-title">${selectedIntro.title}</h1>
                            
                            <div class="badges-container">
                                ${selectedIntro.badges.map(badge => `
                                    <div class="badge">
                                        <div class="badge-text">${badge}</div>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="bottom-section">
                                <div class="users-joined">
                                    <span class="users-joined-text">${selectedIntro.description}</span>
                                </div>
                                <button id="start-quiz" class="cta-button">${selectedIntro.buttonText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gradient"></div>
        `;
        
        // Add click handler using the existing startQuiz function
        const startButton = landingContent.querySelector('#start-quiz');
        if (startButton) {
            startButton.addEventListener('click', startQuiz);
        }
        
    } else {
        if (modernCssLink) {
            modernCssLink.remove();
        }
        document.body.classList.remove('modern-intro');
        
        // Update DOM elements for classic design
        document.getElementById('landing-emoji').textContent = selectedIntro.emoji;
        document.getElementById('landing-title').textContent = selectedIntro.title;
        document.getElementById('landing-description').textContent = selectedIntro.description;
        document.getElementById('start-quiz').textContent = selectedIntro.buttonText;
    }
    
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
        case 'Aha_Quiz':
            window.quizData = quizDataG;
            break;
    }
}

// Initialize the intro screen when the page loads
document.addEventListener('DOMContentLoaded', updateIntroScreen); 