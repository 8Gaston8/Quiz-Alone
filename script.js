document.addEventListener('DOMContentLoaded', () => {
    // Quiz state
    let currentQuestion = 0;
    let userAnswers = [];

    // Fun fact titles with different colors
    const funFactStyles = [
        { title: "Mind-Blowing Fact! 🤯", gradient: "45deg, #F01E6F, #EF6F5E" },
        { title: "You Won't Believe This! 😱", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "What You Should Know 👇", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "Check This Out! ✨", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "Fun Fact Alert! 🎯", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "Did You Know? 🤔", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "Wow Factor! 🌟", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "Here's the Scoop! 🍨", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "Quick Fact! ⚡️", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "Last But Not Least! 🎉", gradient: "45deg, #EF6F5E, #F01E6F" }
    ];

    // DOM Elements
    const landingEl = document.getElementById('landing');
    const quizEl = document.getElementById('quiz');
    const resultsEl = document.getElementById('results');
    const questionEl = document.getElementById('question');
    const choicesEl = document.getElementById('choices');
    const submitBtn = document.getElementById('submit');
    const startQuizBtn = document.getElementById('start-quiz');
    const statementEl = document.getElementById('statement');
    const nextQuestionBtn = document.getElementById('next-question');
    const statementTextEl = document.querySelector('.statement-text');
    const statementTitleEl = document.querySelector('.statement-title');
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    function createEmojiConfetti() {
        const emojis = ['🎉', '✨', '💫', '⭐️', '🌟', '🎊', '🎈'];
        const container = document.querySelector('.quiz-container');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Create multiple bursts
        for (let burst = 0; burst < 3; burst++) {
            setTimeout(() => {
                // Create confetti pieces for each burst
                for (let i = 0; i < 20; i++) {
                    const emoji = document.createElement('div');
                    emoji.className = 'floating-emoji';
                    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    
                    // Random position calculations
                    const angle = (Math.random() * 360) * (Math.PI / 180);
                    const velocity = 300 + Math.random() * 200;
                    const finalX = Math.cos(angle) * velocity;
                    const finalY = Math.sin(angle) * velocity - 200; // Adjust for gravity
                    const rotation = Math.random() * 720 - 360; // Random rotation between -360 and 360 degrees
                    
                    // Set initial position at the center of the container
                    emoji.style.left = `${centerX}px`;
                    emoji.style.top = `${centerY}px`;
                    emoji.style.fontSize = `${Math.random() * 10 + 20}px`;
                    
                    // Set custom properties for the animation
                    emoji.style.setProperty('--final-x', `${finalX}px`);
                    emoji.style.setProperty('--final-y', `${finalY}px`);
                    emoji.style.setProperty('--rotation', `${rotation}deg`);
                    
                    document.body.appendChild(emoji);
                    
                    // Remove the emoji after animation
                    setTimeout(() => emoji.remove(), 1500);
                }
            }, burst * 200); // Stagger each burst
        }
    }

    function updateProgress() {
        const progress = ((currentQuestion + 1) / quizData.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${currentQuestion + 1} of ${quizData.length}`;
    }

    function showSection(sectionToShow) {
        [landingEl, quizEl, statementEl, resultsEl].forEach(section => {
            section.classList.toggle('active', section === sectionToShow);
        });
        
        // Track screen view with unique names
        let screenName;
        if (sectionToShow === landingEl) {
            screenName = 'welcome_screen';
        } else if (sectionToShow === quizEl) {
            // Get unique name based on current question
            const question = quizData[currentQuestion];
            if (question) {
                // Generate a screen name based on the question content
                const questionText = question.question.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 30);
                screenName = `question_${questionText}`;
            } else {
                screenName = `question_${currentQuestion + 1}`;
            }
        } else if (sectionToShow === statementEl) {
            // Get unique name for each fact screen based on the current question
            const question = quizData[currentQuestion];
            if (question) {
                // Generate a fact screen name based on the fun fact content
                const factText = question.funFact.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 30);
                screenName = `fact_${factText}`;
            } else {
                screenName = `fact_${currentQuestion + 1}`;
            }
        } else if (sectionToShow === resultsEl) {
            screenName = 'final_results';
        }
        
        if (screenName) {
            trackQuizScreenView(screenName);
        }
    }

    function loadQuestion() {
        console.log('Loading question:', currentQuestion);
        console.log('Quiz data available:', quizData);
        const question = quizData[currentQuestion];
        console.log('Current question:', question);
        questionEl.textContent = question.question;
        
        choicesEl.innerHTML = '';
        
        // Get or create skip button
        let skipBtn = document.getElementById('skip-question');
        if (!skipBtn) {
            skipBtn = document.createElement('button');
            skipBtn.id = 'skip-question';
            skipBtn.classList.add('skip-button');
            skipBtn.textContent = 'Skip';
            skipBtn.addEventListener('click', () => {
                if (currentQuestion === quizData.length - 1) {
                    showResults();
                } else {
                    currentQuestion++;
                    showSection(quizEl);
                    loadQuestion();
                }
            });
            document.querySelector('.question-card').appendChild(skipBtn);
        }
        
        if (question.type === 'email') {
            skipBtn.style.display = 'none';
            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.placeholder = 'Enter your email address';
            emailInput.pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
            emailInput.classList.add('email-input');
            emailInput.addEventListener('input', () => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const isValid = emailInput.value.trim() !== '' && emailRegex.test(emailInput.value);
                submitBtn.disabled = !isValid;
                emailInput.classList.toggle('invalid', !isValid);
            });
            submitBtn.disabled = true; // Initially disable the button
            choicesEl.appendChild(emailInput);
        } else {
            skipBtn.style.display = 'block';
            question.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.textContent = option;
                button.classList.add('choice-button');
                button.addEventListener('click', () => selectChoice(index));
                choicesEl.appendChild(button);
            });
            submitBtn.disabled = true;
        }
        
        updateProgress();
    }

    function selectChoice(index) {
        const choices = choicesEl.getElementsByClassName('choice-button');
        Array.from(choices).forEach(choice => choice.classList.remove('selected'));
        choices[index].classList.add('selected');
        submitBtn.disabled = false;
    }

    function showStatement() {
        const style = funFactStyles[currentQuestion];
        statementTitleEl.textContent = style.title;
        statementTitleEl.style.background = `linear-gradient(${style.gradient})`;
        statementTitleEl.style.webkitBackgroundClip = 'text';
        statementTitleEl.style.webkitTextFillColor = 'transparent';
        
        statementTextEl.textContent = quizData[currentQuestion].funFact;
        showSection(statementEl);
    }

    async function submitAnswer() {
        if (quizData[currentQuestion].type === 'email') {
            const emailInput = choicesEl.querySelector('.email-input');
            if (!emailInput || !emailInput.value || !emailInput.checkValidity()) {
                emailInput.classList.add('invalid');
                return;
            }
            const email = emailInput.value;
            userAnswers.push(email);

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Processing... ⏳';

            // Make API calls when email is submitted
            try {
                const result = await handleEmailSubmission(email);
                if (result?.sessionUrl) {
                    // Store the session URL for later use
                    window.quizSessionUrl = result.sessionUrl;
                }
                
                // Store email and branch link in localStorage
                localStorage.setItem('atly_user_email', email);
                if (result?.branchLink) {
                    localStorage.setItem('atly_branch_link', result.branchLink);
                }
                
                // Add a small delay to show the loading state
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error submitting quiz:', error);
                // Reset button state on error
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Next 👉';
                return; // Don't proceed if API call fails
            }

            // Reset button state
            submitBtn.innerHTML = 'Next 👉';
            
            // Skip statement screen for email submission and go directly to next question
            currentQuestion++;
            loadQuestion();
        } else {
            const selectedChoice = choicesEl.querySelector('.choice-button.selected');
            if (!selectedChoice) return;
            const answerIndex = Array.from(choicesEl.children).indexOf(selectedChoice);
            userAnswers.push(answerIndex);
            
            // For non-email questions, check if we've reached the end
            if (currentQuestion === quizData.length - 1) {
                showResults();
            } else {
                showStatement();
            }
        }
    }

    function showResults() {
        const loadingState = document.querySelector('.loading-state');
        const finalState = document.querySelector('.final-state');
        
        showSection(resultsEl);
        loadingState.style.display = 'block';
        finalState.style.display = 'none';
        
        setTimeout(() => {
            loadingState.style.display = 'none';
            finalState.style.display = 'block';
            createEmojiConfetti();
        }, 3000);
    }

    function startQuiz() {
        currentQuestion = 0;
        userAnswers = [];
        // Remove modern intro styling
        document.body.classList.remove('modern-intro');
        showSection(quizEl);
        loadQuestion();
    }

    // Event Listeners
    startQuizBtn.addEventListener('click', startQuiz);
    submitBtn.addEventListener('click', submitAnswer);
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestion++;
        showSection(quizEl);
        loadQuestion();
    });

    // Download button
    const downloadMapBtn = document.getElementById('download-map');
    if (downloadMapBtn) {
        downloadMapBtn.addEventListener('click', () => {
            if (window.quizSessionUrl) {
                const checkoutInfo = selectCheckoutScreen();
                let finalUrl = checkoutInfo.url + window.quizSessionUrl.substring(window.quizSessionUrl.indexOf('?'));
                
                // Add user ID as client_reference_id if available
                if (window.quizUserId) {
                    finalUrl += `&client_reference_id=${window.quizUserId}`;
                }
                
                trackQuizCheckout(checkoutInfo.variant, checkoutInfo.price);
                window.location.href = finalUrl;
            } else {
                console.error('No session URL available');
            }
        });
    }
}); 