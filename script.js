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
    }

    function loadQuestion() {
        const question = quizData[currentQuestion];
        questionEl.textContent = question.question;
        
        choicesEl.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('choice-button');
            button.addEventListener('click', () => selectChoice(index));
            choicesEl.appendChild(button);
        });
        
        submitBtn.disabled = true;
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

    function submitAnswer() {
        const selectedChoice = choicesEl.querySelector('.choice-button.selected');
        if (!selectedChoice) return;
        
        const answerIndex = Array.from(choicesEl.children).indexOf(selectedChoice);
        userAnswers.push(answerIndex);
        
        if (currentQuestion < quizData.length - 1) {
            showStatement();
        } else {
            showResults();
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
            window.location.href = 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2';
        });
    }
}); 