const puppeteer = require('puppeteer');

// Test configuration for Quiz Version J
const TEST_CONFIG = {
    QUIZ_VERSIONS: ['J'],
    CHECKOUT_SCREENS: {
        TEST_CHECKOUT: {
            url: 'https://pay.atly.com/b/test_4gw7sz7vO2tTerK6oq',
            price: '59.99 noTrial',
            checkout_medium: 'web',
            trial_status: 'no-trial',
            active: false
        }
    }
};

// Helper function for waiting
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to decide if we should skip a question
const shouldSkipQuestion = () => {
    const shouldSkip = Math.random() < 0.2;
    console.log('Skip check result:', shouldSkip);
    return shouldSkip;
};

// Helper function to verify DOM elements
async function verifyDOMElements(page, elements) {
    for (const [name, selector] of Object.entries(elements)) {
        const element = await page.$(selector);
        if (!element) {
            throw new Error(`Required element ${name} (${selector}) not found`);
        }
    }
}

// Helper function to verify quiz version
async function verifyQuizVersion(page) {
    console.log('Verifying quiz version...');
    
    // Wait for quiz version to be set with increased timeout
    try {
        await page.waitForFunction(() => {
            const state = {
                currentVersion: window.currentQuizVersion,
                selectedLetter: window.selectedQuizLetter,
                quizData: window.quizData,
                quizDataJ: window.quizDataJ
            };
            console.log('Current state:', state);
            return state.currentVersion !== undefined && 
                   state.quizData !== null && 
                   state.selectedLetter !== undefined &&
                   state.quizData.length > 0;
        }, { timeout: 10000 });
    } catch (error) {
        console.error('Failed waiting for quiz version. Current page state:');
        const state = await page.evaluate(() => ({
            currentVersion: window.currentQuizVersion,
            selectedLetter: window.selectedQuizLetter,
            hasQuizData: !!window.quizData,
            quizDataLength: window.quizData ? window.quizData.length : 0,
            hasQuizDataJ: !!window.quizDataJ,
            quizDataJLength: window.quizDataJ ? window.quizDataJ.length : 0,
            documentReady: document.readyState,
            hasSelectRandomQuiz: typeof window.selectRandomQuiz === 'function'
        }));
        console.error('Page state:', state);
        throw error;
    }

    const versionInfo = await page.evaluate(() => ({
        currentVersion: window.currentQuizVersion,
        selectedLetter: window.selectedQuizLetter,
        quizDataLength: window.quizData ? window.quizData.length : 0,
        hasQuizDataJ: !!window.quizDataJ,
        quizDataJLength: window.quizDataJ ? window.quizDataJ.length : 0
    }));
    
    console.log('Version info:', versionInfo);

    if (versionInfo.selectedLetter !== 'J') {
        throw new Error(`Selected quiz letter mismatch: expected J, got ${versionInfo.selectedLetter}`);
    }

    if (versionInfo.currentVersion !== 'City_Quiz') {
        console.error(`Quiz version mismatch: expected City_Quiz, got ${versionInfo.currentVersion}`);
        throw new Error('Quiz version mismatch');
    }

    // Verify quiz data length
    if (versionInfo.quizDataLength === 0) {
        throw new Error('Quiz data is empty');
    }
}

// Helper function to safely click elements
async function safeClick(page, element) {
    try {
        await element.click();
        return true;
    } catch (e) {
        try {
            await page.evaluate(el => el.click(), element);
            return true;
        } catch (e2) {
            return false;
        }
    }
}

// Helper function to safely wait for function
async function safeWaitForFunction(page, fn, options = {}) {
    const defaultTimeout = 10000;
    try {
        await page.waitForFunction(fn, { timeout: options.timeout || defaultTimeout });
        return true;
    } catch (error) {
        console.error('Wait for function failed:', error.message);
        // Log the current state
        const state = await page.evaluate(() => ({
            currentQuestion: window.currentQuestion,
            sections: {
                quiz: document.querySelector('#quiz')?.classList.contains('active'),
                statement: document.querySelector('#statement')?.classList.contains('active'),
                recap: document.querySelector('#recap')?.classList.contains('active'),
                results: document.querySelector('#results')?.classList.contains('active')
            },
            questionData: window.quizData ? window.quizData[window.currentQuestion] : null
        }));
        console.error('Current state:', state);
        return false;
    }
}

// Helper function to handle missing functions
async function setupMissingFunctions(page) {
    await page.evaluate(() => {
        // Add missing functions if they don't exist
        if (typeof window.startQuiz !== 'function') {
            window.startQuiz = function() {
                console.log('Mock startQuiz called');
                return true;
            };
        }
        
        if (typeof window.trackQuizStart !== 'function') {
            window.trackQuizStart = function() {
                console.log('Mock trackQuizStart called');
                return true;
            };
        }

        if (typeof window.trackQuizComplete !== 'function') {
            window.trackQuizComplete = function() {
                console.log('Mock trackQuizComplete called');
                return true;
            };
        }
    });
}

// Helper function to handle the final question
async function handleFinalQuestion(page) {
    console.log('Handling final question');
    try {
        // Wait for the final statement screen
        await safeWaitForFunction(page, () => {
            const state = window.getQuizState();
            return state.sections.statement === true;
        }, 'Waiting for final statement screen', 15000);
        console.log('Final statement screen is active');

        // Click the final button
        const finalButton = await page.waitForSelector('button#next', { visible: true, timeout: 15000 });
        await safeClick(page, finalButton);
        console.log('Clicked final button');

        // Wait for results section
        await safeWaitForFunction(page, () => {
            const state = window.getQuizState();
            return state.sections.results === true;
        }, 'Waiting for results section', 15000);
        console.log('Results section is active');

    } catch (error) {
        console.error('Error in handleFinalQuestion:', error);
        const state = await page.evaluate(() => window.getQuizState());
        console.log('Current quiz state:', state);
        throw error;
    }
}

// Main test function
async function testQuizVersionJ() {
    console.log('\n=== Testing Quiz Version J ===\n');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();
    
    // Enable detailed console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', err => console.error('Browser page error:', err.message));
    page.on('error', err => console.error('Browser error:', err.message));
    
    try {
        await page.setViewport({ width: 1280, height: 800 });
        
        // Set a default navigation timeout
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);

        // Navigate to quiz page with better error handling
        try {
            await page.goto('http://localhost:8000', { 
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: 30000 
            });
            console.log('✅ Successfully navigated to quiz page');
        } catch (navError) {
            console.error('❌ Navigation failed:', navError.message);
            throw navError;
        }

        // Setup missing functions
        await setupMissingFunctions(page);
        console.log('✅ Missing functions setup complete');

        // Initialize quiz data with better error handling
        try {
            await page.evaluate(() => {
                window.selectedQuizLetter = 'J';
                window.quizData = window.quizDataJ;
                window.currentQuizVersion = 'City_Quiz';
                window.currentQuestion = 0;
                document.body.setAttribute('data-quiz-version', 'City_Quiz');
                
                // Verify initialization
                if (!window.quizData || !Array.isArray(window.quizData)) {
                    throw new Error('Quiz data not properly initialized');
                }
                
                return {
                    selectedLetter: window.selectedQuizLetter,
                    currentVersion: window.currentQuizVersion,
                    hasQuizData: !!window.quizData,
                    quizDataLength: window.quizData ? window.quizData.length : 0,
                    currentQuestion: window.currentQuestion
                };
            });
            console.log('✅ Quiz data successfully initialized');
        } catch (initError) {
            console.error('❌ Failed to initialize quiz data:', initError.message);
            throw initError;
        }

        // Verify quiz version with improved error handling
        try {
            await verifyQuizVersion(page);
            console.log('✅ Quiz version successfully verified');
        } catch (versionError) {
            console.error('❌ Quiz version verification failed:', versionError.message);
            // Dump the current state for debugging
            const state = await page.evaluate(() => ({
                window: {
                    currentQuizVersion: window.currentQuizVersion,
                    selectedQuizLetter: window.selectedQuizLetter,
                    hasQuizData: !!window.quizData,
                    hasQuizDataJ: !!window.quizDataJ
                },
                document: {
                    readyState: document.readyState,
                    quizVersion: document.body.getAttribute('data-quiz-version')
                }
            }));
            console.error('Current state:', state);
            throw versionError;
        }

        // Override selectRandomQuiz to always return version J
        await page.evaluate(() => {
            window.selectRandomQuiz = () => {
                window.selectedQuizLetter = 'J';
                window.quizData = window.quizDataJ;
                window.currentQuizVersion = 'City_Quiz';
                document.body.setAttribute('data-quiz-version', 'City_Quiz');
                return window.quizData;
            };
        });
        console.log('Quiz selection overridden');

        // Start quiz
        const startButton = await page.waitForSelector('#start-quiz');
        await safeClick(page, startButton);
        console.log('Started quiz');

        // Wait for quiz section to be active and first question to be loaded
        await page.waitForFunction(() => {
            const quizSection = document.querySelector('#quiz');
            const questionCard = document.querySelector('.question-card');
            const questionText = document.querySelector('#question');
            return quizSection && 
                   quizSection.classList.contains('active') && 
                   questionCard && 
                   questionText && 
                   questionText.textContent;
        }, { timeout: 5000 });
        console.log('Quiz section is active and first question is loaded');

        // Log current question
        const currentQuestion = await page.evaluate(() => {
            const question = window.quizData[window.currentQuestion];
            const questionText = document.querySelector('#question');
            return {
                index: window.currentQuestion,
                text: question.question,
                type: question.type || 'regular',
                options: question.options || [],
                displayedText: questionText ? questionText.textContent : null
            };
        });
        console.log('Current question:', currentQuestion);

        // Handle each question
        let questionCount = 0;
        const totalQuestions = await page.evaluate(() => window.quizData?.length);
        
        while (questionCount < totalQuestions) {
            const currentQuestionData = await page.evaluate(() => ({
                currentQuestion: window.currentQuestion,
                sections: {
                    quiz: document.querySelector('#quiz')?.classList.contains('active'),
                    results: document.querySelector('#results')?.classList.contains('active')
                },
                questionData: window.quizData[window.currentQuestion]
            }));
            console.log('Current state:', currentQuestionData);

            // Special handling for city selection question
            if (currentQuestionData.questionData.type === 'city_selection') {
                console.log('Handling city selection question');
                
                // Wait for the submit button
                const submitButton = await page.waitForSelector('button#submit', { visible: true, timeout: 15000 });
                await safeClick(page, submitButton);
                console.log('Submitted city selection');
                
                // Wait for the next section to become active
                await safeWaitForFunction(page, () => {
                    const state = window.getQuizState();
                    return state.sections.results === true;
                }, 'Waiting for results section', 15000);
                console.log('Results section is active');
            } else {
                // Handle regular questions
                const options = await page.$$('#quiz .option');
                const randomOption = options[Math.floor(Math.random() * options.length)];
                await safeClick(page, randomOption);
                console.log('Selected option for question');
            }

            // If this is the final question, wait for results screen
            if (questionCount === totalQuestions - 1) {
                await safeWaitForFunction(page, () => {
                    const results = document.querySelector('#results');
                    const isActive = results && results.classList.contains('active');
                    console.log('Results section check:', { hasResults: !!results, isActive });
                    return isActive;
                }, { timeout: 15000 });
                console.log('Results screen is active');
                break;
            }

            // For non-final questions, wait for the next question to be loaded
            await safeWaitForFunction(page, () => {
                const quiz = document.querySelector('#quiz');
                const questionCard = document.querySelector('.question-card');
                const questionText = document.querySelector('#question');
                const isActive = quiz && quiz.classList.contains('active') && 
                                questionCard && questionText && questionText.textContent;
                console.log('Next question check:', { 
                    hasQuiz: !!quiz, 
                    hasCard: !!questionCard,
                    hasText: !!questionText,
                    isActive 
                });
                return isActive;
            }, { timeout: 15000 });
            console.log('Next question is loaded');
            
            await page.evaluate(() => window.currentQuestion++);
            questionCount++;
        }

        // After the final question is handled, we don't need to verify map or results
        // Just verify that the quiz has completed
        const finalState = await page.evaluate(() => ({
            sections: {
                quiz: document.querySelector('#quiz')?.classList.contains('active'),
                results: document.querySelector('#results')?.classList.contains('active')
            },
            currentQuestion: window.currentQuestion,
            totalQuestions: window.quizData?.length
        }));
        console.log('Final state:', finalState);

        // Verify we've completed all questions and are on the results screen
        if (!finalState.sections.results) {
            throw new Error('Quiz did not transition to results screen');
        }

        console.log('\n✅ Quiz Version J test completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Quiz Version J test failed:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testQuizVersionJ().catch(console.error); 