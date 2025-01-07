document.addEventListener('DOMContentLoaded', () => {
    // Quiz state
    let currentQuestion = 0;
    let userAnswers = [];

    // Set quiz version for version K
    if (window.selectedQuizLetter === 'K') {
        currentQuizVersion = 'Direct_Access';
        window.currentQuizVersion = 'Direct_Access';
        document.body.setAttribute('data-quiz-version', 'Direct_Access');
    }

    // Hide progress tracker initially
    const progressTracker = document.querySelector('.progress-tracker');
    if (progressTracker) {
        progressTracker.style.display = 'none';
    }

    // Fun fact titles with different colors
    const funFactStyles = [
        { title: "<span class='gradient-text'>Mind-Blowing Fact!</span> 🤯", gradient: "45deg, #F01E6F, #EF6F5E" },
        { title: "<span class='gradient-text'>You Won't Believe This!</span> 😱", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "<span class='gradient-text'>What You Should Know</span> 👇", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "<span class='gradient-text'>Check This Out!</span> ✨", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "<span class='gradient-text'>Fun Fact Alert!</span> 🎯", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "<span class='gradient-text'>Did You Know?</span> 🤔", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "<span class='gradient-text'>Wow Factor!</span> 🌟", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "<span class='gradient-text'>Here's the Scoop!</span> 🍨", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "<span class='gradient-text'>Quick Fact!</span> ⚡️", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "<span class='gradient-text'>Last But Not Least!</span> 🎉", gradient: "45deg, #EF6F5E, #F01E6F" },
        { title: "<span class='gradient-text'>Almost There!</span> 🎯", gradient: "-45deg, #F01E6F, #EF6F5E" },
        { title: "<span class='gradient-text'>Special Offer!</span> 🎁", gradient: "45deg, #EF6F5E, #F01E6F" }
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
    const recapEl = document.getElementById('recap');
    const finishRecapBtn = document.getElementById('finish-recap');

    function shouldShowProgressBar() {
        // Do a fresh random assignment each time
        const progressBarVisible = Math.random() < 0.5;
        console.log('New A/B test assignment:', progressBarVisible ? 'showing progress bar' : 'hiding progress bar');
        return progressBarVisible;
    }

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
        // Only update progress if the progress bar is visible
        if (progressTracker.style.display === 'block') {
            const progress = ((currentQuestion + 1) / quizData.length) * 100;
            progressBar.style.width = `${progress}%`;
            if (!hidePageNumbers) {  // Only show page numbers if not hidden
                progressText.textContent = `${currentQuestion + 1} of ${quizData.length}`;
            } else {
                progressText.textContent = '';  // Hide the page numbers
            }
        }
    }

    function showSection(sectionToShow) {
        [landingEl, quizEl, statementEl, resultsEl, recapEl].forEach(section => {
            section.classList.toggle('active', section === sectionToShow);
        });
        
        // Track screen view with unique names
        let screenName;
        if (sectionToShow === landingEl) {
            screenName = 'welcome_screen';
        } else if (sectionToShow === quizEl && window.selectedQuizLetter !== 'K') {
            // Only get question-based screen name if not version K
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
        } else if (sectionToShow === statementEl && window.selectedQuizLetter !== 'K') {
            // Only get fact-based screen name if not version K
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
        } else if (sectionToShow === recapEl) {
            screenName = 'answer_recap';
        } else if (sectionToShow === resultsEl) {
            screenName = 'final_results';
        }
        
        if (screenName) {
            // Get progress bar visibility state directly from the DOM
            const progressBarVisible = progressTracker.style.display === 'block';
            // Add progress bar visibility to tracking event
            const additionalProps = { progress_bar_visible: progressBarVisible };
            
            // For version K, override the quiz_version property
            if (window.selectedQuizLetter === 'K') {
                additionalProps.quiz_version = 'Direct_Access';
                additionalProps.quiz_description = 'Direct Access Quiz';
            }
            
            trackQuizScreenView(screenName, additionalProps);
        }
    }

    // Make showSection globally available
    window.showSection = showSection;

    function loadQuestion() {
        console.log('Loading question:', currentQuestion);
        console.log('Quiz data available:', quizData);
        const question = quizData[currentQuestion];
        console.log('Current question:', question);
        
        // Handle custom render function
        if (question.render && typeof question.render === 'function') {
            question.render(document.querySelector('.question-card'));
            return;
        }
        
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
                    if (currentQuizVersion === 'Aha_Quiz' || currentQuizVersion === 'Value_Quiz') {
                        showRecap();
                    } else {
                        showResults();
                    }
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
            submitBtn.disabled = true;
            choicesEl.appendChild(emailInput);
        } else if (!question.render) { // Only show regular choices if not using custom render
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

    // Make loadQuestion globally available
    window.loadQuestion = loadQuestion;

    function selectChoice(index) {
        const choices = choicesEl.getElementsByClassName('choice-button');
        Array.from(choices).forEach(choice => choice.classList.remove('selected'));
        choices[index].classList.add('selected');
        submitBtn.disabled = false;
    }

    function showStatement() {
        const style = funFactStyles[currentQuestion];
        statementTitleEl.innerHTML = style.title;
        
        statementTextEl.textContent = quizData[currentQuestion].funFact;
        showSection(statementEl);
    }

    function showRecap() {
        const recapAnswers = document.querySelector('.recap-answers');
        recapAnswers.innerHTML = '';
        
        // Create a container for the recap content and scroll indicator
        const recapContainer = document.createElement('div');
        recapContainer.className = 'recap-container';
        recapContainer.style.position = 'relative';
        recapContainer.style.width = '100%';
        recapContainer.style.height = '100%';
        recapContainer.style.overflow = 'hidden';
        
        // Add scroll indicator
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = '👇';
        scrollIndicator.style.position = 'fixed';
        scrollIndicator.style.bottom = '80px';
        scrollIndicator.style.left = '50%';
        scrollIndicator.style.transform = 'translateX(-50%)';
        scrollIndicator.style.zIndex = '1000';
        scrollIndicator.style.fontSize = '24px';
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.animation = 'bounce 1s infinite';
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        
        document.querySelector('.recap-content').appendChild(scrollIndicator);
        
        // Generate personalized title based on answers
        let title = "Your Gluten-Free Story";
        
        // Count answers to determine user profile
        let concerns = 0;
        let adventurous = 0;
        let cautious = 0;
        
        quizData.forEach((question, index) => {
            if (question.type === 'email' || userAnswers[index] === undefined) return;
            
            const answer = question.options[userAnswers[index]];
            
            // Analyze answers to determine user profile
            if (question.question.includes("worry about gluten")) {
                if (answer === "All the time") concerns += 2;
                if (answer === "Sometimes") concerns += 1;
            }
            if (question.question.includes("had a reaction")) {
                if (answer === "Yes, multiple times") concerns += 2;
                if (answer === "Yes, but rarely") concerns += 1;
            }
            if (question.question.includes("how far would you travel")) {
                if (answer === "Over 30 minutes") adventurous += 2;
                if (answer === "20-30 minutes") adventurous += 1;
            }
            if (question.question.includes("discover new")) {
                if (answer === "Trial and error") adventurous += 2;
                if (answer === "Friend recommendations") adventurous += 1;
            }
            if (question.question.includes("confident asking staff")) {
                if (answer === "Very confident") adventurous += 2;
                if (answer === "Sometimes") adventurous += 1;
            }
            if (answer === "Safety" || answer === "Cross-contamination") cautious += 1;
        });
        
        // Determine title based on profile scores
        if (concerns > adventurous && concerns > cautious) {
            title = "Your Safe Dining Journey";
        } else if (adventurous > concerns && adventurous > cautious) {
            title = "Your Food Adventure Story";
        } else if (cautious > concerns && cautious > adventurous) {
            title = "Your Mindful Dining Path";
        } else if (concerns > 0 && adventurous > 0) {
            title = "Your Smart Dining Journey";
        }
        
        // Update the title in the DOM
        const titleEl = document.querySelector('.recap-title');
        titleEl.innerHTML = `<span class="gradient-text">${title}</span> 🌟`;
        
        // Create recap items for each question-answer pair
        quizData.forEach((question, index) => {
            // Skip email question and skipped questions
            if (question.type === 'email' || userAnswers[index] === undefined) return;
            
            const recapItem = document.createElement('div');
            recapItem.className = 'recap-item';
            
            const questionText = document.createElement('div');
            questionText.className = 'recap-question';
            questionText.textContent = question.question;
            
            const answerText = document.createElement('div');
            answerText.className = 'recap-answer';
            answerText.textContent = question.options[userAnswers[index]];
            
            recapItem.appendChild(questionText);
            recapItem.appendChild(answerText);
            recapAnswers.appendChild(recapItem);
        });
        
        showSection(recapEl);
        
        // Animate items sequentially
        const items = recapAnswers.querySelectorAll('.recap-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 200); // 200ms delay between each item
        });
        
        // Show/hide scroll indicator based on scroll position only
        const checkScroll = () => {
            const content = document.querySelector('.recap-content');
            const isAtBottom = content.scrollHeight - content.scrollTop <= content.clientHeight + 50;
            scrollIndicator.style.display = isAtBottom ? 'none' : 'block';
        };
        
        // Check initially and on window resize
        setTimeout(checkScroll, 500);
        window.addEventListener('resize', checkScroll);
        
        // Update on scroll
        document.querySelector('.recap-content').addEventListener('scroll', checkScroll);
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
                if (currentQuizVersion === 'Aha_Quiz' || currentQuizVersion === 'Value_Quiz') {
                    showRecap(); // Show recap for version G and H
                } else {
                    showResults(); // Show results directly for other versions
                }
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
        // For version K, redirect directly to Atly payment page
        if (window.selectedQuizLetter === 'K') {
            mixpanel.track('indirectQuiz_Checkout', {
                price: '99.99 trial (30 days)',
                quiz_version: 'Direct_Access',
                quiz_description: 'Direct Access Quiz',
                style_version: 'light'
            }, function() {
                // Only redirect after tracking is complete
                window.location.href = 'https://pay.atly.com/b/00gdUJ8yp3C2cIofZf';
            });
            return;
        }

        currentQuestion = 0;
        userAnswers = [];
        // Remove modern intro styling
        document.body.classList.remove('modern-intro');
        // Set quiz version as data attribute
        document.body.setAttribute('data-quiz-version', currentQuizVersion);
        // Show progress tracker only for the test group that should see it
        if (progressTracker) {
            progressTracker.style.display = shouldShowProgressBar() ? 'block' : 'none';
        }
        showSection(quizEl);
        loadQuestion();
    }

    // Make startQuiz globally available
    window.startQuiz = startQuiz;

    // Event Listeners - only add if elements exist
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', (e) => {
            if (window.selectedQuizLetter === 'K') {
                e.preventDefault();
                // Track event and wait for it to complete before redirecting
                mixpanel.track('indirectQuiz_Checkout', {
                    price: '99.99 trial (30 days)',
                    quiz_version: 'Direct_Access',
                    quiz_description: 'Direct Access Quiz',
                    style_version: 'light'
                }, function() {
                    window.location.href = 'https://pay.atly.com/b/00gdUJ8yp3C2cIofZf';
                });
            } else {
                startQuiz();
            }
        });
    }
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAnswer);
    }
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            currentQuestion++;
            showSection(quizEl);
            loadQuestion();
        });
    }
    if (finishRecapBtn) {
        finishRecapBtn.addEventListener('click', showResults);
    }

    // Download button
    const downloadMapBtn = document.querySelector('#download-map');
    const midCtaBtn = document.querySelector('.mid-cta-button');

    const handleCheckout = () => {
        const checkoutInfo = selectCheckoutScreen();
        let finalUrl;

        if (window.quizSessionUrl) {
            finalUrl = checkoutInfo.url + window.quizSessionUrl.substring(window.quizSessionUrl.indexOf('?'));
        } else {
            console.warn('No session URL available, using fallback URL');
            const email = localStorage.getItem('atly_user_email');
            finalUrl = `${checkoutInfo.url}${email ? `?prefilled_email=${encodeURIComponent(email)}` : ''}`;
        }
        
        // Add user ID as client_reference_id if available
        if (window.quizUserId) {
            finalUrl += `${finalUrl.includes('?') ? '&' : '?'}client_reference_id=${window.quizUserId}`;
        }
        
        trackQuizCheckout(checkoutInfo.variant, checkoutInfo.price);
        window.location.href = finalUrl;
    };

    if (downloadMapBtn) {
        downloadMapBtn.addEventListener('click', handleCheckout);
    }

    if (midCtaBtn) {
        midCtaBtn.addEventListener('click', handleCheckout);
    }
}); 