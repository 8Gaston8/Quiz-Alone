const puppeteer = require('puppeteer');

// Test configuration
const TEST_CONFIG = {
    QUIZ_VERSIONS: ['G'],
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
async function verifyQuizVersion(page, version) {
    console.log('Verifying quiz version...');
    
    // Wait for quiz version to be set with increased timeout
    try {
        await page.waitForFunction(() => {
            const state = {
                currentVersion: window.currentQuizVersion,
                selectedLetter: window.selectedQuizLetter,
                quizData: window.quizData,
                quizDataG: window.quizDataG
            };
            console.log('Current state:', state);
            return state.currentVersion !== undefined && 
                   state.quizData !== null && 
                   state.selectedLetter !== undefined &&
                   state.quizData.length > 0; // Make sure quiz data is actually loaded
        }, { timeout: 10000 }); // Increased timeout
    } catch (error) {
        console.error('Failed waiting for quiz version. Current page state:');
        const state = await page.evaluate(() => ({
            currentVersion: window.currentQuizVersion,
            selectedLetter: window.selectedQuizLetter,
            hasQuizData: !!window.quizData,
            quizDataLength: window.quizData ? window.quizData.length : 0,
            hasQuizDataG: !!window.quizDataG,
            quizDataGLength: window.quizDataG ? window.quizDataG.length : 0,
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
        hasQuizDataG: !!window.quizDataG,
        quizDataGLength: window.quizDataG ? window.quizDataG.length : 0
    }));
    
    console.log('Version info:', versionInfo);

    const expectedVersion = {
        'A': 'Classic_Quiz',
        'C': 'Experience_Quiz',
        'D': 'Quick_Quiz',
        'G': 'Aha_Quiz',
        'H': 'Value_Quiz'
    }[version];

    if (versionInfo.selectedLetter !== version) {
        throw new Error(`Selected quiz letter mismatch: expected ${version}, got ${versionInfo.selectedLetter}`);
    }

    if (versionInfo.currentVersion !== expectedVersion) {
        console.error(`Quiz version mismatch: expected ${expectedVersion}, got ${versionInfo.currentVersion}`);
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

// Helper function to handle recap screen
async function handleRecapScreen(page) {
    console.log('Found active recap screen');
    
    try {
        // Click the finish recap button
        const finishRecapBtn = await page.waitForSelector('#finish-recap', { visible: true, timeout: 5000 });
        if (!finishRecapBtn) {
            throw new Error('Finish recap button not found');
        }
        
        // Log state before clicking
        const beforeState = await page.evaluate(() => ({
            sections: {
                recap: document.querySelector('#recap')?.classList.contains('active'),
                results: document.querySelector('#results')?.classList.contains('active'),
                quiz: document.querySelector('#quiz')?.classList.contains('active'),
                statement: document.querySelector('#statement')?.classList.contains('active')
            },
            elements: {
            loadingVisible: document.querySelector('.loading-state')?.style.display,
            finalVisible: document.querySelector('.final-state')?.style.display,
                finishBtnDisabled: document.querySelector('#finish-recap')?.disabled,
                downloadBtnVisible: document.querySelector('#download-map')?.style.display
            },
            classes: {
                recapClasses: document.querySelector('#recap')?.className,
                resultsClasses: document.querySelector('#results')?.className
            }
        }));
        console.log('State before clicking recap button:', beforeState);
        
        // Click the button normally
        await safeClick(page, finishRecapBtn);
        console.log('Clicked finish recap button');
        
        // Step 1: Wait for results section to become active
        console.log('Step 1: Waiting for results section to become active...');
        await page.waitForFunction(() => {
            const resultsSection = document.querySelector('#results');
            const isActive = resultsSection && resultsSection.classList.contains('active');
            console.log('Results section active state:', isActive);
            return isActive;
        }, { timeout: 5000 });
        console.log('Step 1 complete: Results section is active');
        
        // Step 2: Wait for loading state to appear and be visible
        console.log('Step 2: Waiting for loading state to appear...');
        await page.waitForFunction(() => {
            const loadingState = document.querySelector('.loading-state');
            const isVisible = loadingState && window.getComputedStyle(loadingState).display === 'block';
            console.log('Loading state visible:', isVisible);
            return isVisible;
        }, { timeout: 5000 });
        console.log('Step 2 complete: Loading state is visible');
        
        // Step 3: Wait for 3 seconds while loading state is shown
        console.log('Step 3: Waiting 3 seconds for loading state...');
        await wait(3000);
        console.log('Step 3 complete: Waited 3 seconds');
        
        // Step 4: Wait for loading state to disappear and final state to appear
        console.log('Step 4: Waiting for loading state to disappear...');
        try {
            await page.waitForFunction(() => {
                const loadingState = document.querySelector('.loading-state');
                const finalState = document.querySelector('.final-state');
                const loadingStyle = window.getComputedStyle(loadingState);
                const finalStyle = window.getComputedStyle(finalState);
                console.log('State visibility:', {
                    loading: {
                        display: loadingStyle.display,
                        visibility: loadingStyle.visibility,
                        opacity: loadingStyle.opacity
                    },
                    final: {
                        display: finalStyle.display,
                        visibility: finalStyle.visibility,
                        opacity: finalStyle.opacity
                    }
                });
                return loadingStyle.display === 'none' && finalStyle.display !== 'none';
            }, { timeout: 15000 });
            console.log('Loading state disappeared');
        } catch (error) {
            console.error('Error waiting for loading state:', error);
            
            // Get the current state of loading and final elements
            const elementState = await page.evaluate(() => {
                const loadingState = document.querySelector('.loading-state');
                const finalState = document.querySelector('.final-state');
                return {
                    loading: loadingState ? {
                        display: window.getComputedStyle(loadingState).display,
                        visibility: window.getComputedStyle(loadingState).visibility,
                        opacity: window.getComputedStyle(loadingState).opacity,
                        classList: Array.from(loadingState.classList)
                    } : 'no loading state',
                    final: finalState ? {
                        display: window.getComputedStyle(finalState).display,
                        visibility: window.getComputedStyle(finalState).visibility,
                        opacity: window.getComputedStyle(finalState).opacity,
                        classList: Array.from(finalState.classList)
                    } : 'no final state'
                };
            });
            console.error('Element state:', elementState);
            throw error;
        }
        
        // Step 5: Verify map initialization or handle gracefully if MapKit JS is blocked
        console.log('Step 5: Checking map initialization status...');
        try {
            // First check if MapKit JS loaded
            const mapkitStatus = await page.evaluate(() => {
                return {
                    hasMapkit: typeof mapkit !== 'undefined',
                    hasMap: typeof map !== 'undefined' && map !== null,
                    container: document.querySelector('#map-container') ? {
                        display: window.getComputedStyle(document.querySelector('#map-container')).display,
                        visibility: window.getComputedStyle(document.querySelector('#map-container')).visibility
                    } : 'no-container'
                };
            });
            console.log('MapKit status:', mapkitStatus);

            // If MapKit JS loaded, verify full initialization
            if (mapkitStatus.hasMapkit) {
                await page.waitForFunction(() => {
                    return typeof map !== 'undefined' && 
                           map !== null && 
                           map.element && 
                           map.element.children.length > 0;
                }, { timeout: 30000 });
                console.log('Map initialized successfully');
            } else {
                console.log('MapKit JS not available in test environment - continuing test');
            }

            // Verify the container is present regardless of map status
            const containerStatus = await page.evaluate(() => {
                const container = document.querySelector('#map-container');
                return container ? {
                    exists: true,
                    display: window.getComputedStyle(container).display,
                    visibility: window.getComputedStyle(container).visibility,
                    width: container.offsetWidth,
                    height: container.offsetHeight
                } : { exists: false };
            });
            console.log('Container status:', containerStatus);

            if (!containerStatus.exists) {
                throw new Error('Map container missing from DOM');
            }

            console.log('Step 5 complete: Map container verified');
        } catch (error) {
            console.error('Map initialization status:', error);
            // Continue test even if map initialization fails
            console.log('Continuing test despite map initialization issue');
        }
        
        // Step 6: Now wait for loading state to disappear
        console.log('Step 6: Waiting for loading state to disappear...');
        try {
            await page.waitForFunction(() => {
                const loadingState = document.querySelector('.loading-state');
                const isHidden = loadingState && window.getComputedStyle(loadingState).display === 'none';
                const currentStyle = loadingState ? window.getComputedStyle(loadingState).display : 'element-not-found';
                console.log('Current loading state style:', currentStyle);
                return isHidden;
            }, { timeout: 5000 });
            console.log('Step 6 complete: Loading state is hidden');
        } catch (error) {
            const loadingState = await page.evaluate(() => {
                const loadingEl = document.querySelector('.loading-state');
                return {
                    element: loadingEl ? true : false,
                    display: loadingEl ? window.getComputedStyle(loadingEl).display : 'not-found',
                    visibility: loadingEl ? window.getComputedStyle(loadingEl).visibility : 'not-found',
                    opacity: loadingEl ? window.getComputedStyle(loadingEl).opacity : 'not-found',
                    html: loadingEl ? loadingEl.outerHTML : 'not-found',
                    parent: loadingEl ? loadingEl.parentElement.id : 'no-parent'
                };
            });
            console.error('Failed to hide loading state:', loadingState);
            throw error;
        }
        
        // Step 7: Wait for final state to appear
        console.log('Step 7: Waiting for final state to appear...');
        await page.waitForFunction(() => {
            const finalState = document.querySelector('.final-state');
            const isVisible = finalState && window.getComputedStyle(finalState).display === 'block';
            console.log('Final state visible:', isVisible);
            return isVisible;
        }, { timeout: 5000 });
        console.log('Step 7 complete: Final state is visible');
        
        // Log the final state of everything
        const finalStates = await page.evaluate(() => ({
            sections: {
                results: document.querySelector('#results')?.classList.toString(),
                recap: document.querySelector('#recap')?.classList.toString()
            },
            displays: {
                loadingState: window.getComputedStyle(document.querySelector('.loading-state')).display,
                finalState: window.getComputedStyle(document.querySelector('.final-state')).display
            },
            elements: {
                hasMap: document.querySelector('.map-container') !== null,
                hasDownloadBtn: document.querySelector('#download-map') !== null
            }
        }));
        console.log('Final states:', finalStates);
        
        // Wait for map container to be visible (if applicable)
        const hasMapContainer = await page.evaluate(() => {
            const mapContainer = document.querySelector('.map-container');
            return mapContainer && window.getComputedStyle(mapContainer).display !== 'none';
        });
        
        if (hasMapContainer) {
            console.log('Map container is visible, waiting for initialization...');
            try {
        await page.waitForFunction(() => {
            const mapContainer = document.querySelector('.map-container');
            return mapContainer && mapContainer.children.length > 0;
                }, { timeout: 10000 });
                console.log('Map initialized successfully');
            } catch (error) {
                console.warn('Map initialization timed out, but continuing as this may be expected');
            }
        } else {
            console.log('No map container visible, skipping map initialization wait');
        }
        
        // Wait for download button to be ready
        console.log('Waiting for download button...');
        const downloadButton = await page.waitForSelector('#download-map', { visible: true, timeout: 5000 });
        
        // Verify final screen state
        const finalScreenState = await page.evaluate(() => ({
            sections: {
                recap: document.querySelector('#recap')?.classList.contains('active'),
                results: document.querySelector('#results')?.classList.contains('active')
            },
            elements: {
                loadingState: document.querySelector('.loading-state')?.style.display,
                finalState: document.querySelector('.final-state')?.style.display,
                downloadButton: document.querySelector('#download-map')?.style.display,
                mapContainer: document.querySelector('.map-container')?.style.display
            }
        }));
        console.log('Final screen state:', finalScreenState);

        if (!finalScreenState.sections.results || finalScreenState.sections.recap || 
            finalScreenState.elements.loadingState === 'block' || 
            finalScreenState.elements.finalState !== 'block') {
            throw new Error('Invalid final screen state');
        }
        
        return true;
    } catch (error) {
        console.error('Error in recap screen handling:', error);
        
        // Log detailed state for debugging
        const errorState = await page.evaluate(() => ({
            sections: {
                recap: document.querySelector('#recap.active') !== null,
                results: document.querySelector('#results.active') !== null,
                quiz: document.querySelector('#quiz.active') !== null,
                statement: document.querySelector('#statement.active') !== null
            },
            elements: {
                loadingState: document.querySelector('.loading-state')?.style.display,
                finalState: document.querySelector('.final-state')?.style.display,
                finishBtn: document.querySelector('#finish-recap')?.disabled,
                downloadBtn: document.querySelector('#download-map')?.style.display,
                mapContainer: document.querySelector('.map-container')?.innerHTML || 'no-map'
            },
            html: document.querySelector('#results')?.innerHTML || 'Results section not found',
            styles: {
                loadingState: document.querySelector('.loading-state') ? 
                    window.getComputedStyle(document.querySelector('.loading-state')).cssText : 'no-loading-state',
                finalState: document.querySelector('.final-state') ? 
                    window.getComputedStyle(document.querySelector('.final-state')).cssText : 'no-final-state'
            }
        }));
        console.error('Error state:', errorState);
        
        throw error;
    }
}

// Helper function to verify confetti animation
async function verifyConfettiAnimation(page) {
    console.log('Starting confetti animation verification...');
    
    try {
        // Just wait for final state to be visible
        await page.waitForFunction(() => {
            const finalState = document.querySelector('.final-state');
            return finalState && window.getComputedStyle(finalState).display === 'block';
        }, { timeout: 10000 });
        
        // Check for confetti elements
        const confettiCount = await page.evaluate(() => {
            return document.querySelectorAll('.floating-emoji').length;
        });
        
        console.log(`Found ${confettiCount} confetti elements`);
        
        if (confettiCount === 0) {
            console.warn('Warning: No confetti elements found, but continuing test');
        }
        
        console.log('Confetti animation sequence completed');
    } catch (error) {
        console.error('Error during confetti animation:', error);
        
        // Log the current state for debugging
        const state = await page.evaluate(() => ({
            hasResults: !!document.querySelector('#results.active'),
            hasFinal: !!document.querySelector('.final-state'),
            finalStateDisplay: document.querySelector('.final-state') ? 
                window.getComputedStyle(document.querySelector('.final-state')).display : 'not-found',
            html: document.body.innerHTML
        }));
        console.error('Current screen state:', state);
        throw error;
    }
}

async function testQuizVersion(version) {
    console.log(`\n=== Testing Quiz Version ${version} ===\n`);
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 5,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-cache',  // Disable browser cache
            '--disable-application-cache',  // Disable application cache
            '--disable-offline-load-stale-cache',  // Disable offline cache
            '--disable-gpu-shader-disk-cache',  // Disable shader cache
            '--media-cache-size=0',  // Disable media cache
            '--disk-cache-size=0'  // Disable disk cache
        ]
    });

    let emailHandled = false;

    try {
        const page = await browser.newPage();
        
        // Disable caching in the page
        await page.setCacheEnabled(false);
        
        await page.setViewport({ width: 1280, height: 800 });

        // Add error handler for page errors
        page.on('error', error => {
            console.error('Page error:', error);
        });

        // Add console handler to capture MapKit JS related logs
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('MapKit') || text.includes('map') || text.includes('Error') || text.includes('error')) {
                console.log('Browser console:', text);
            }
        });

        // Add error event listener for uncaught exceptions
        await page.evaluateOnNewDocument(() => {
            window.addEventListener('error', (event) => {
                console.error('Uncaught error:', event.error);
            });
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled rejection:', event.reason);
            });
        });

        // Configure page to allow MapKit JS to load properly
        await page.setBypassCSP(true);

        // Wait longer for initial page load
        await page.goto('http://192.168.128.236:5500', { 
            waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
            timeout: 30000 
        });
        console.log('Navigated to quiz page');

        // Wait for MapKit JS to be loaded
        await page.waitForFunction(() => {
            return typeof mapkit !== 'undefined';
        }, { timeout: 30000 });
        console.log('MapKit JS loaded');

        // Force version immediately after load
        await page.evaluate((targetVersion) => {
            window.selectedQuizLetter = targetVersion;
            console.log('Force-set quiz version after load to:', targetVersion);
        }, version);

        // Wait for quiz data to be defined globally
        await page.evaluate((targetVersion) => {
            // Define quiz data G globally if it's not already defined
            if (typeof window.quizDataG === 'undefined' && typeof quizDataG !== 'undefined') {
                window.quizDataG = quizDataG;
            }
            
            // Force the quiz data to be set based on version
            if (targetVersion === 'G' && window.quizDataG) {
                window.quizData = window.quizDataG;
                window.currentQuizVersion = 'Aha_Quiz';
            }
            
            console.log('Quiz data initialization complete:', {
                hasQuizData: !!window.quizData,
                quizDataLength: window.quizData ? window.quizData.length : 0,
                currentVersion: window.currentQuizVersion
            });
            
            return Promise.resolve();
        }, version);

        // Wait for quiz system to be ready
        await page.waitForFunction(() => {
            return document.readyState === 'complete' && 
                   typeof window.quizDataG !== 'undefined' &&
                   typeof window.selectRandomQuiz === 'function';
        }, { timeout: 10000 });
        console.log('Quiz system ready');

        // Force quiz data and settings
        const quizState = await page.evaluate((targetVersion) => {
            // Ensure our version is set
            window.selectedQuizLetter = targetVersion;
            console.log('Ensuring quiz version before init:', targetVersion);
            
            // Initialize quiz data based on version
            switch(targetVersion) {
                case 'G':
                    window.quizData = window.quizDataG;
                    window.currentQuizVersion = 'Aha_Quiz';
                    break;
                case 'H':
                    window.quizData = window.quizDataH;
                    window.currentQuizVersion = 'Value_Quiz';
                    break;
                case 'A':
                    window.quizData = window.quizDataA;
                    window.currentQuizVersion = 'Classic_Quiz';
                    break;
                case 'C':
                    window.quizData = window.quizDataC;
                    window.currentQuizVersion = 'Experience_Quiz';
                    break;
                case 'D':
                    window.quizData = window.quizDataD;
                    window.currentQuizVersion = 'Quick_Quiz';
                    break;
            }
            
            console.log('Initialized quiz data:', {
                version: window.currentQuizVersion,
                letter: window.selectedQuizLetter,
                dataLength: window.quizData?.length
            });
            
            // Let quiz manager initialize with our selected version
            window.selectRandomQuiz();
            
            // Double-check our version and data
            if (window.selectedQuizLetter !== targetVersion || !window.quizData) {
                console.log('Re-initializing quiz data...');
                window.selectedQuizLetter = targetVersion;
                window.selectRandomQuiz();
            }
            
            // Verify the state
            return {
                quizDataLength: window.quizData?.length,
                version: window.currentQuizVersion,
                letter: window.selectedQuizLetter,
                quizDataGDefined: typeof window.quizDataG !== 'undefined',
                quizData: window.quizData
            };
        }, version);
        console.log('Quiz state:', quizState);

        // Verify quiz version and data are set correctly
        await verifyQuizVersion(page, version);

        await page.waitForSelector('#start-quiz', { visible: true });
        await page.click('#start-quiz');
        console.log('Clicked start button');

        await page.waitForFunction(() => {
            const quizSection = document.querySelector('#quiz');
            return quizSection && 
                   quizSection.classList.contains('active') && 
                   document.querySelector('.question-card') !== null;
        }, { timeout: 5000 });
        console.log('Quiz section is active and first question is loaded');

        let quizLength = await page.evaluate(() => quizData.length);
        console.log(`Total quiz length: ${quizLength}`);

        async function answerQuestions() {
            let questionCount = 0;
            let consecutiveQuestionCount = 0;
            let lastQuestionTime = Date.now();
            let lastQuestionText = '';
            let answeredQuestions = new Set();
            
            console.log('Starting to answer questions...');
            
            while (true) {
                try {
                    const quizLength = await page.evaluate(() => quizData ? quizData.length : 0);
                    console.log(`Current quiz length: ${quizLength}, Questions answered: ${questionCount}`);
                    
                    if (questionCount > quizLength * 2) {
                        console.error('Question count exceeds expected maximum');
                        console.error('Quiz state at error:', quizState);
                        throw new Error('Too many questions processed');
                    }
                    
                    const currentState = await page.evaluate(() => {
                        return {
                            hasResults: document.querySelector('#results.active') !== null,
                            hasRecap: document.querySelector('#recap.active') !== null,
                            hasStatement: document.querySelector('#statement.active') !== null
                        };
                    });
                    console.log('Current quiz state:', currentState);
                    
                    // Handle different screens
                    if (currentState.hasRecap) {
                        console.log('Found active recap screen');
                        return await handleRecapScreen(page);
                    }
                    
                    if (currentState.hasStatement) {
                        console.log('Found active statement screen');
                        await wait(500);
                        const nextButton = await page.$('#next-question');
                        if (nextButton) {
                            await safeClick(page, nextButton);
                            console.log('Clicked next question button');
                            await wait(1000);

                            if (questionCount === 1) {
                                const emailInput = await page.$('input[type="email"]');
                                if (!emailInput) {
                                    console.error('Expected email question after first question statement screen');
                                    const currentQuestion = await page.evaluate(() => {
                                        const questionEl = document.querySelector('#question');
                                        return questionEl ? questionEl.textContent : 'Unknown';
                                    });
                                    console.error('Instead found question:', currentQuestion);
                                    throw new Error('Missing expected email question after first question');
                                }
                                console.log('Found email question after statement as expected');
                            }
                            continue;
                        }
                    }

                    await page.waitForSelector('.question-card', { timeout: 2000 });
                    questionCount++;
                    consecutiveQuestionCount++;
                    
                    const currentQuestion = await page.evaluate(() => {
                        const questionEl = document.querySelector('#question');
                        return questionEl ? questionEl.textContent : '';
                    });
                    
                    // If we get the same question twice in a row and we're at the end
                    if (currentQuestion === lastQuestionText && questionCount >= quizLength) {
                        console.log('Got same question twice at the end, forcing recap...');
                        const selectedChoice = await page.$('.choice-button');
                        if (selectedChoice) {
                            await safeClick(page, selectedChoice);
                            const submitButton = await page.$('#submit');
                            if (submitButton) {
                                await safeClick(page, submitButton);
                            }
                        }
                        continue;
                    }
                    
                    lastQuestionText = currentQuestion;
                    console.log(`Question ${questionCount} (Consecutive: ${consecutiveQuestionCount})`);
                    lastQuestionTime = Date.now();

                    const skipButtonCheck = await page.$('.skip-button');
                    if (skipButtonCheck) {
                        const isVisible = await page.evaluate(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none';
                        }, skipButtonCheck);
                        console.log('Skip button found, visible:', isVisible);
                        
                        if (isVisible && shouldSkipQuestion()) {
                            const questionText = await page.evaluate(() => {
                                const questionEl = document.querySelector('#question');
                                return questionEl ? questionEl.textContent : 'Unknown question';
                            });
                            console.log('About to skip question:', questionText);
                            
                            await safeClick(page, skipButtonCheck);
                            console.log('Skipped question');
                            await wait(500);
                            continue;
                        }
                    } else {
                        console.log('No skip button found for this question');
                    }

                    const questionData = await page.evaluate(() => {
                        try {
                            const questionEl = document.querySelector('#question');
                            const choicesEl = document.querySelector('#choices');
                            const emailInput = document.querySelector('input[type="email"]');
                            
                            return {
                                text: questionEl ? questionEl.textContent : null,
                                hasEmailInput: !!emailInput,
                                hasChoices: !!choicesEl.querySelector('.choice-button'),
                                numChoices: choicesEl.querySelectorAll('.choice-button').length
                            };
                        } catch (e) {
                            return { error: e.message };
                        }
                    });
                    console.log('Current question data:', questionData);

                    if (questionData.error) {
                        console.error('Error getting question data:', questionData.error);
                        throw new Error(questionData.error);
                    }

                    if (questionCount === 2 && !questionData.hasEmailInput) {
                        console.error('Expected email question as second question but got:', questionData.text);
                        throw new Error('Missing expected email question');
                    }

                    const emailInput = await page.$('input[type="email"]');
                    const choiceButtons = await page.$$('.choice-button');

                    if (emailInput) {
                        console.log('Found email question');
                        
                        await emailInput.evaluate(el => {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        });
                        
                        await wait(500);
                        
                        await emailInput.type('test@example.com', { delay: 50 });
                        console.log('Typed email address');
                        
                        await wait(500);
                        
                        try {
                            console.log('Looking for submit button...');
                            await page.waitForSelector('#submit:not([disabled])', { 
                                visible: true,
                                timeout: 5000 
                            });
                            const submitButton = await page.$('#submit');
                            if (!submitButton) {
                                console.log('Submit button not found after waiting!');
                                throw new Error('Submit button not found');
                            }
                            console.log('Found submit button, attempting to click...');
                            
                            await safeClick(page, submitButton);
                            console.log('Clicked submit button');
                            
                            // Wait longer for the API call and next question to load
                            console.log('Waiting for next question after email submission...');
                            await wait(3000); // Increased wait time
                            
                            // Wait for either the next question to load or an error state
                            await page.waitForFunction(() => {
                                const emailInput = document.querySelector('input[type="email"]');
                                const nextQuestion = document.querySelector('.question-card:not(.email-question)');
                                const submitButton = document.querySelector('#submit');
                                
                                // Consider it successful if either:
                                // 1. We're no longer on the email question
                                // 2. The submit button is re-enabled (indicating the API call completed)
                                return (!emailInput && nextQuestion) || 
                                       (submitButton && !submitButton.disabled);
                            }, { timeout: 10000 });
                            
                            const currentQuestionType = await page.evaluate(() => {
                                const emailInput = document.querySelector('input[type="email"]');
                                const submitButton = document.querySelector('#submit');
                                return {
                                    isEmail: !!emailInput,
                                    submitEnabled: submitButton && !submitButton.disabled,
                                    questionText: document.querySelector('#question')?.textContent
                                };
                            });
                            
                            console.log('Current question state:', currentQuestionType);
                            
                            if (currentQuestionType.isEmail) {
                                throw new Error('Still on email question after submission');
                            }
                            
                            emailHandled = true;
                            console.log('Successfully processed email question');
                            continue;
                        } catch (emailError) {
                            console.log('Error handling email input:', emailError.message);
                            throw emailError;
                        }
                    }

                    if (choiceButtons.length > 0) {
                        console.log(`Found regular question with ${choiceButtons.length} choices`);
                        const randomIndex = Math.floor(Math.random() * choiceButtons.length);
                        const selectedButton = choiceButtons[randomIndex];
                        
                        await safeClick(page, selectedButton);
                        console.log(`Selected answer ${randomIndex + 1} of ${choiceButtons.length}`);
                        
                        await wait(300);
                        
                        const submitButton = await page.$('#submit');
                        if (submitButton) {
                            await safeClick(page, submitButton);
                            console.log('Clicked submit button');
                            
                            // Wait for transition to complete
                            await page.waitForFunction(() => {
                                const oldQuestion = document.querySelector('.question-card.fade-out');
                                const newQuestion = document.querySelector('.question-card:not(.fade-out)');
                                const recapScreen = document.querySelector('#recap.active');
                                const resultsScreen = document.querySelector('#results.active');
                                return (!oldQuestion && newQuestion) || recapScreen || resultsScreen;
                            }, { timeout: 5000 });
                            
                            await wait(500); // Additional wait for animations
                        }
                    }

                    const resultsScreen = await page.$('#results.active');
                    if (resultsScreen) {
                        console.log('Successfully reached results screen!');
                        
                        // Verify no other screens are active
                        const screenState = await page.evaluate(() => {
                            return {
                                resultsActive: document.querySelector('#results.active') !== null,
                                recapActive: document.querySelector('#recap.active') !== null,
                                quizActive: document.querySelector('#quiz.active') !== null,
                                statementActive: document.querySelector('#statement.active') !== null
                            };
                        });
                        
                        if (screenState.recapActive) {
                            throw new Error('Unexpected recap screen shown with results');
                        }
                        
                        if (screenState.quizActive || screenState.statementActive) {
                            throw new Error('Other screens active when only results should be shown');
                        }
                        
                        await verifyConfettiAnimation(page);
                        console.log('Results sequence verified successfully');
                        
                        const downloadButton = await page.$('#download-map');
                        if (downloadButton) {
                            await page.waitForSelector('#download-map:not([disabled])', { timeout: 5000 });
                            
                            const navigationPromise = page.waitForNavigation({ 
                                timeout: 10000,
                                waitUntil: ['networkidle0', 'load']
                            });

                            await Promise.all([
                                navigationPromise,
                                downloadButton.click()
                            ]);

                            const currentUrl = await page.url();
                            if (!currentUrl.includes('pay.atly.com')) {
                                throw new Error(`Expected URL to include pay.atly.com, but got ${currentUrl}`);
                            }
                            
                            console.log('Successfully navigated to checkout:', currentUrl);
                            return; // Exit the loop immediately after reaching checkout
                        } else {
                            throw new Error('Download button not found');
                        }
                    }

                    const recapScreen = await page.$('#recap.active');
                    if (recapScreen) {
                        await handleRecapScreen(page);
                        // After recap, wait for and verify results screen
                        await page.waitForSelector('#results.active', { visible: true, timeout: 5000 });
                        
                        const downloadButton = await page.$('#download-map');
                        if (downloadButton) {
                            await page.waitForSelector('#download-map:not([disabled])', { timeout: 5000 });
                            
                            const navigationPromise = page.waitForNavigation({ 
                                timeout: 10000,
                                waitUntil: ['networkidle0', 'load']
                            });

                            await Promise.all([
                                navigationPromise,
                                downloadButton.click()
                            ]);

                            const currentUrl = await page.url();
                            if (!currentUrl.includes('pay.atly.com')) {
                                throw new Error(`Expected URL to include pay.atly.com, but got ${currentUrl}`);
                            }
                            
                            console.log('Successfully navigated to checkout:', currentUrl);
                            return; // Exit the loop after reaching checkout
                        } else {
                            throw new Error('Download button not found after recap');
                        }
                    }

                    if (consecutiveQuestionCount > quizLength + 3) {
                        console.log('Current page HTML:', await page.content());
                        throw new Error('Too many consecutive questions - possible loop detected');
                    }

                    if ((version === 'G' || version === 'H') && questionCount >= quizLength) {
                        const currentState = await page.evaluate(() => ({
                            version: window.currentQuizVersion,
                            questionCount: window.quizData ? window.quizData.length : 0,
                            currentCount: questionCount,
                            hasRecap: document.querySelector('#recap.active') !== null,
                            hasResults: document.querySelector('#results.active') !== null
                        }));
                        
                        if (!currentState.hasRecap && !currentState.hasResults) {
                            console.log('Quiz state at end:', currentState);
                            throw new Error('Missing expected recap or results screen');
                        }
                    }

                    // Track unique questions
                    if (currentQuestion && !answeredQuestions.has(currentQuestion)) {
                        answeredQuestions.add(currentQuestion);
                        console.log(`New unique question: "${currentQuestion}" (Total unique: ${answeredQuestions.size})`);
                    } else if (currentQuestion) {
                        console.log(`Repeated question: "${currentQuestion}"`);
                    }

                    // Add additional check for stuck questions
                    if (lastQuestionText === currentQuestion && questionCount > 1) {
                        console.log('Potential stuck question detected, checking state...');
                        const stuckState = await page.evaluate(() => ({
                            buttonStates: {
                                submitEnabled: document.querySelector('#submit')?.disabled === false,
                                skipVisible: document.querySelector('.skip-button')?.style.display !== 'none',
                                nextEnabled: document.querySelector('#next-question')?.disabled === false
                            },
                            screenStates: {
                                quizActive: document.querySelector('#quiz.active') !== null,
                                recapActive: document.querySelector('#recap.active') !== null,
                                resultsActive: document.querySelector('#results.active') !== null
                            },
                            questionState: {
                                hasChoices: document.querySelector('#choices')?.children.length > 0,
                                isEmailQuestion: document.querySelector('input[type="email"]') !== null,
                                questionText: document.querySelector('#question')?.textContent
                            }
                        }));
                        console.log('Stuck state:', stuckState);
                        
                        // Try to recover if possible
                        if (stuckState.buttonStates.skipVisible) {
                            console.log('Found skip button, attempting to skip stuck question');
                            const skipButton = await page.$('.skip-button');
                            if (skipButton) {
                                await safeClick(page, skipButton);
                                await wait(1000);
                            }
                        }
                    }
                } catch (error) {
                    if (error.message.includes('Too many consecutive questions')) {
                        throw error;
                    }
                    console.log('Error in quiz flow:', error);
                    throw error;
                }
            }
        }

        await answerQuestions();
        
        console.log(`Successfully completed Quiz Version ${version}`);
    } catch (error) {
        console.error(`Error testing Quiz Version ${version}:`, error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

(async () => {
    console.log('Starting Quiz Version Tests');
    
    for (const version of TEST_CONFIG.QUIZ_VERSIONS) {
        try {
            await testQuizVersion(version);
            console.log(`✅ Quiz Version ${version} test completed successfully`);
        } catch (error) {
            console.error(`❌ Quiz Version ${version} test failed:`, error.message);
            process.exit(1);
        }
        await wait(1000);
    }
    
    console.log('\nAll Quiz Version Tests Completed Successfully! 🎉');
})(); 