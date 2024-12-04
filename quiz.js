console.log('Loading quiz system...');

let quizData = null;
let currentQuizVersion = '';

function selectRandomQuiz() {
    const versions = ['A', 'B', 'C'];
    const randomIndex = Math.floor(Math.random() * versions.length);
    const selectedVersion = versions[randomIndex];
    
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
    }
    
    console.log(`Selected quiz version: ${currentQuizVersion}`);
    return quizData;
}

// Initialize quiz data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    selectRandomQuiz();
});

console.log('Quiz data loaded successfully');

// Rest of the quiz logic remains the same... 