console.log('Loading quiz version J data...');

// Global variables for places data
let placesData = null;
let availableCities = new Set();

// Check for stored city on load
const storedCity = localStorage.getItem('selectedCity');
if (storedCity) {
    window.selectedCity = JSON.parse(storedCity);
    localStorage.removeItem('selectedCity');
}

// Use the global placesData
if (typeof window.placesData === 'undefined') {
    window.placesData = null;
}

window.quizDataJ = [
    {
        question: "What's your biggest frustration with gluten-free dining?",
        options: [
            "Finding desserts",
            "Social situations",
            "Menu confusion"
        ],
        funFact: "Over 60% of people following a gluten-free diet report social challenges when dining out. Atly makes it easier to find inclusive dining spots!"
    },
    {
        question: "What's your email address? (We'll save your progress)",
        options: [],
        type: "email",
        funFact: "We'll use your email to create your personalized gluten-free restaurant guide!"
    },
    {
        question: "Who do you usually dine out with?",
        options: [
            "Family",
            "Friends",
            "Solo"
        ],
        funFact: "Atly's group dining feature helps you find restaurants that cater to mixed dietary needs!"
    },
    {
        question: "What's your favorite meal of the day?",
        options: [
            "Breakfast",
            "Lunch",
            "Dinner"
        ],
        funFact: "Atly categorizes restaurants by meal type, making it easy to find gluten-free options any time of day."
    },
    {
        question: "How do you feel about shared kitchens?",
        options: [
            "Very concerned",
            "Somewhat worried",
            "Not concerned"
        ],
        funFact: "Atly provides detailed information about kitchen practices and cross-contamination protocols."
    },
    {
        question: "What's your ideal restaurant atmosphere?",
        options: [
            "Quiet and cozy",
            "Lively and social",
            "Quick and casual"
        ],
        funFact: "Atly includes atmosphere ratings to help you find the perfect dining environment."
    },
    {
        question: "Do you have other dietary restrictions?",
        options: [
            "Yes, several",
            "Just one other",
            "No, just gluten"
        ],
        funFact: "Atly lets you filter restaurants by multiple dietary restrictions for a perfectly tailored experience."
    },
    {
        question: "How important is organic/natural food?",
        options: [
            "Very important",
            "Somewhat important",
            "Not important"
        ],
        funFact: "Many gluten-free restaurants on Atly also specialize in organic and natural ingredients!"
    },
    {
        question: "What's your favorite comfort food?",
        options: [
            "Pizza",
            "Pasta",
            "Sandwiches"
        ],
        funFact: "Atly helps you find the best gluten-free versions of your favorite comfort foods!"
    },
    {
        question: "How far are your favorite restaurants?",
        options: [
            "Within 5 miles",
            "5-15 miles",
            "15+ miles"
        ],
        funFact: "Atly's location-based search helps you discover hidden gems in your preferred radius!"
    },
    {
        question: "Ready to discover your new favorite spots?",
        options: [
            "Can't wait!",
            "Tell me more",
            "Still deciding"
        ],
        funFact: "Join the Atly community and never worry about finding safe, delicious gluten-free food again!"
    },
    {
        question: "Tell us your city, and we'll show you popular and hidden gluten-free gems.",
        type: "city_selection",
        subheading: "",
        placeholder: "Your city",
        errorMessage: "Please select a valid city.",
        buttonText: "Show GF places!",
        funFact: "Atly has curated lists of safe gluten-free spots in cities across the country!",
        render: function(container) {
            container.innerHTML = `
                <h2 class="question-title">${this.question}</h2>
                <div class="city-input-container" style="position: relative;">
                    <input type="text" id="city-input-quiz" 
                           placeholder="${this.placeholder}" 
                           class="city-autocomplete"
                           autocomplete="off">
                    <div class="search-indicator" style="display: none; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #666;">
                        Searching...
                    </div>
                    <div class="error-message" style="display: none; color: #F01E6F; margin-top: 8px;">${this.errorMessage}</div>
                </div>
                <button id="submit" class="cta-button" disabled>${this.buttonText}</button>
            `;

            const input = document.getElementById('city-input-quiz');
            const submitButton = document.getElementById('submit');
            const errorMessage = container.querySelector('.error-message');
            const searchIndicator = container.querySelector('.search-indicator');

            // Wait for MapKit to be fully loaded and initialized
            const waitForMapKit = () => {
                return new Promise((resolve, reject) => {
                    const maxAttempts = 50; // 5 seconds maximum wait
                    let attempts = 0;
                    
                    const checkMapKit = () => {
                        attempts++;
                        console.log(`Checking MapKit availability (attempt ${attempts})`);
                        
                        if (typeof mapkit !== 'undefined' && typeof mapkit.Search === 'function') {
                            console.log('MapKit and Search constructor are available');
                            resolve();
                        } else if (attempts >= maxAttempts) {
                            console.error('MapKit or Search constructor failed to load after 5 seconds');
                            console.log('Available MapKit components:', {
                                mapkit: typeof mapkit,
                                Search: typeof mapkit?.Search
                            });
                            reject(new Error('MapKit failed to load completely'));
                        } else {
                            setTimeout(checkMapKit, 100);
                        }
                    };
                    checkMapKit();
                });
            };

            // Initialize MapKit once it's loaded
            const initializeMapKit = async () => {
                try {
                    await waitForMapKit();
                    
                    if (mapkit.initialized) {
                        console.log('MapKit already initialized');
                        return;
                    }

                    console.log('Initializing MapKit...');
                    return new Promise((resolve) => {
                        mapkit.init({
                            authorizationCallback: function(done) {
                                const isLocalhost = window.location.hostname === 'localhost' || 
                                    window.location.hostname.includes('127.0.0.1') || 
                                    window.location.hostname.includes('192.168.') ||
                                    window.location.hostname.includes('::1');
                                const mapKitToken = isLocalhost
                                    ? 'eyJraWQiOiIzNFAyOFY1NTNIIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI5N0FWNzZEVUQ0IiwiaWF0IjoxNzM1ODIwOTgxLCJleHAiOjE3MzY0OTU5OTl9.i5AXHawcIs1Db-S_l_iazyWGjwhZbJfA6dwX4iSMPiIL9LbPOFaZV8Qc85dv9555gswewDDkyjZgHny5LMr9xg'
                                    : 'eyJraWQiOiJHUEtMQzdVV0NRIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI5N0FWNzZEVUQ0IiwiaWF0IjoxNzM1MDU0MDEzLCJvcmlnaW4iOiJnbHV0ZW4tZnJlZS1xdWl6LmF0bHkuY29tIn0.bfwG1VUJ-JzDBhP_WGPyUBreFHkjKKflcKn02Z7Oizb1FMkJTCNnKyrn740H_2rYes-iFiZeXPw5Dn1H2q3F_w';
                                console.log('Using token for:', isLocalhost ? 'localhost' : 'production');
                                done(mapKitToken);
                                resolve();
                            }
                        });
                        console.log('MapKit initialization complete');
                    });
                } catch (error) {
                    console.error('Error in initializeMapKit:', error);
                    throw error;
                }
            };

            // Set up the city search functionality
            const setupCitySearch = () => {
                console.log('Setting up city search...');
                
                // Create a search instance
                const search = new mapkit.Search();

                // Function to handle search results
                const handleSearchResults = (error, data) => {
                    console.log('Processing search results:', { error, data });
                    searchIndicator.style.display = 'none';

                    // Clear any existing results
                    const existingResults = document.querySelector('.mapkit-results');
                    if (existingResults) existingResults.remove();

                    if (error) {
                        console.error('Search error:', error);
                        errorMessage.textContent = 'Error searching for cities. Please try again.';
                        errorMessage.style.display = 'block';
                        return;
                    }

                    // Extract results from the search response
                    const results = data?.results || [];
                    if (!results.length) {
                        console.log('No results found');
                        submitButton.disabled = true;
                        window.selectedCity = null;
                        errorMessage.textContent = 'No cities found. Please try a different search.';
                        errorMessage.style.display = 'block';
                        return;
                    }

                    console.log(`Found ${results.length} results:`, results);
                    errorMessage.style.display = 'none';

                    // Create results container
                    const resultsContainer = document.createElement('div');
                    resultsContainer.className = 'mapkit-results';
                    resultsContainer.style.cssText = `
                        position: absolute;
                        top: calc(100% + 5px);
                        left: 0;
                        right: 0;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                        margin-top: 8px;
                        z-index: 1000;
                        max-height: 300px;
                        overflow-y: auto;
                        border: 1px solid #eee;
                    `;

                    // Process and display each result
                    results.forEach(result => {
                        // Only show results that look like cities
                        if (!result.displayLines || result.displayLines.length === 0) return;

                        const displayName = result.displayLines.join(', ');
                        console.log('Processing result:', { result, displayName });
                        
                        const resultItem = document.createElement('div');
                        resultItem.className = 'mapkit-result-item';
                        resultItem.style.cssText = `
                            padding: 12px 16px;
                            cursor: pointer;
                            transition: background-color 0.2s ease;
                            border-bottom: 1px solid #eee;
                            font-size: 14px;
                        `;
                        resultItem.textContent = displayName;

                        resultItem.addEventListener('mouseover', () => {
                            resultItem.style.backgroundColor = 'rgba(240, 30, 111, 0.1)';
                        });
                        resultItem.addEventListener('mouseout', () => {
                            resultItem.style.backgroundColor = 'transparent';
                        });

                        resultItem.addEventListener('click', () => {
                            console.log('Selected result:', result);
                            input.value = displayName;
                            
                            // Complete the search to get full place details
                            search.search(result, (error, placeData) => {
                                if (!error && placeData?.places?.[0]) {
                                    const place = placeData.places[0];
                                    window.selectedCity = {
                                        name: displayName,
                                        latitude: place.coordinate.latitude,
                                        longitude: place.coordinate.longitude,
                                        formatted_address: displayName
                                    };
                                    submitButton.disabled = false;
                                } else {
                                    window.selectedCity = {
                                        name: displayName,
                                        latitude: 0,
                                        longitude: 0,
                                        formatted_address: displayName
                                    };
                                    submitButton.disabled = false;
                                }
                            });
                            
                            errorMessage.style.display = 'none';
                            resultsContainer.remove();
                        });

                        resultsContainer.appendChild(resultItem);
                    });

                    // Only show the results container if we have results
                    if (resultsContainer.children.length > 0) {
                        console.log('Appending results container with', resultsContainer.children.length, 'items');
                        input.parentElement.appendChild(resultsContainer);
                    } else {
                        errorMessage.textContent = 'No cities found. Please try a different search.';
                        errorMessage.style.display = 'block';
                    }
                };

                // Handle input changes
                let searchTimeout;
                input.addEventListener('input', () => {
                    console.log('Input changed:', input.value);
                    submitButton.disabled = true;
                    window.selectedCity = null;
                    errorMessage.style.display = 'none';

                    // Clear existing timeout
                    if (searchTimeout) clearTimeout(searchTimeout);

                    // Clear existing results
                    const existingResults = document.querySelector('.mapkit-results');
                    if (existingResults) existingResults.remove();

                    if (!input.value) {
                        searchIndicator.style.display = 'none';
                        return;
                    }

                    // Show searching indicator
                    searchIndicator.style.display = 'block';

                    // Add debounce to search
                    searchTimeout = setTimeout(() => {
                        console.log('Initiating search for:', input.value);
                        
                        try {
                            // Perform the search with minimal options
                            search.autocomplete(input.value, (error, data) => {
                                console.log('Raw search response:', { error, data });
                                handleSearchResults(error, data);
                            });
                        } catch (error) {
                            console.error('Search error:', error);
                            errorMessage.textContent = 'Error searching for cities. Please try again.';
                            errorMessage.style.display = 'block';
                            searchIndicator.style.display = 'none';
                        }
                    }, 300);
                });

                // Handle click outside to close results
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.city-input-container')) {
                        const results = document.querySelector('.mapkit-results');
                        if (results) results.remove();
                    }
                });
                
                console.log('City search setup complete');
            };

            // Initialize MapKit and set up search
            (async () => {
                try {
                    console.log('Starting MapKit initialization...');
                    await initializeMapKit();
                    console.log('MapKit initialized, setting up city search...');
                    setupCitySearch();

                    // Add submit button handler
                    submitButton.addEventListener('click', async () => {
                        if (window.selectedCity) {
                            console.log('Submitting selected city:', window.selectedCity);
                            
                            // Add loading state
                            const originalText = submitButton.textContent;
                            submitButton.disabled = true;
                            submitButton.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    <div class="loader" style="
                                        width: 20px;
                                        height: 20px;
                                        border: 3px solid #ffffff;
                                        border-bottom-color: transparent;
                                        border-radius: 50%;
                                        display: inline-block;
                                        animation: rotation 1s linear infinite;
                                    "></div>
                                    Loading...
                                </div>
                                <style>
                                    @keyframes rotation {
                                        0% { transform: rotate(0deg) }
                                        100% { transform: rotate(360deg) }
                                    }
                                </style>
                            `;
                            
                            try {
                                // Ensure minimum loading time of 2 seconds
                                await Promise.all([
                                    loadPlacesData(),
                                    new Promise(resolve => setTimeout(resolve, 2000))
                                ]);
                                
                                console.log('Selected city name:', window.selectedCity.name.split(',')[0].toLowerCase());
                                
                                // Filter places for the selected city
                                const cityPlaces = placesData.filter(place => {
                                    if (!place || !place.lat || !place.lon) {
                                        console.log('Found place without coordinates:', place);
                                        return false;
                                    }

                                    // Calculate distance between selected city and place
                                    const distance = calculateDistance(
                                        window.selectedCity.latitude,
                                        window.selectedCity.longitude,
                                        place.lat,
                                        place.lon
                                    );

                                    // Consider places within 20km radius
                                    const isNearby = distance <= 20;
                                    if (isNearby) {
                                        console.log(`Found nearby place: ${place.title} (${distance.toFixed(2)}km)`);
                                    }
                                    return isNearby;
                                });

                                if (cityPlaces.length === 0) {
                                    console.log('No places found for city:', window.selectedCity.name);
                                    const cityName = window.selectedCity.name.split(',')[0];
                                    errorMessage.textContent = `No gluten-free spots found in ${cityName} yet. We're constantly adding new places. Try searching nearby cities.`;
                                    errorMessage.style.display = 'block';
                                    submitButton.disabled = true;
                                    // Reset the button text and state
                                    submitButton.innerHTML = originalText;
                                    // Clear the input field
                                    input.value = '';
                                    // Reset the selected city
                                    window.selectedCity = null;
                                    return;
                                }
                                
                                console.log('Found places:', cityPlaces);

                                // Sort places by total_recommendations
                                const sortedPlaces = [...cityPlaces].sort((a, b) => 
                                    (b.total_recommendations || 0) - (a.total_recommendations || 0)
                                );

                                // Get top 3 popular places
                                const popularPlaces = sortedPlaces.slice(0, 3);

                                // Find hidden gem (randomly select from less popular but safe places)
                                const getRandomHiddenGem = (places, excludePlace = null) => {
                                    const safeUnpopularPlaces = places
                                        .filter(place => 
                                            (place.safety_level === "Celiac Friendly" || 
                                            place.safety_level === "100% Dedicated Gluten-Free") &&
                                            (!excludePlace || place.title !== excludePlace.title)
                                        )
                                        .slice(3); // Skip the 3 most popular places

                                    if (safeUnpopularPlaces.length === 0) return null;
                                    
                                    const randomIndex = Math.floor(Math.random() * safeUnpopularPlaces.length);
                                    return safeUnpopularPlaces[randomIndex];
                                };

                                const hiddenGem = getRandomHiddenGem(sortedPlaces);

                                // Clear current content and add results
                                container.innerHTML = `
                                    <div style="padding: 20px;">
                                        <h2 class="question-title" style="
                                            margin-bottom: 30px; 
                                            font-size: clamp(24px, 5vw, 36px);
                                            display: flex;
                                            align-items: center;
                                            gap: 12px;
                                            flex-wrap: wrap;
                                        ">
                                            <span style="
                                                font-size: clamp(20px, 4vw, 28px);
                                                background: rgba(240, 30, 111, 0.1);
                                                padding: 8px;
                                                border-radius: 12px;
                                            ">🔥</span>
                                            <span>GF spots in ${window.selectedCity.name.split(',')[0]}</span>
                                        </h2>
                                        
                                        <div style="
                                            display: grid;
                                            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                                            gap: 20px;
                                            margin: 0 auto;
                                        ">
                                            ${popularPlaces.map(place => `
                                                <div class="place-card" style="
                                                    background: #F8FAFA;
                                                    border-radius: 12px;
                                                    padding: 24px;
                                                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                                    transition: all 0.2s ease;
                                                    cursor: pointer;
                                                    border: 1px solid #eee;
                                                ">
                                                    <h3 style="
                                                        margin: 0 0 12px; 
                                                        color: #333; 
                                                        font-size: 24px;
                                                        font-weight: 600;
                                                    ">${place.title}</h3>
                                                    
                                                    <div style="
                                                        display: inline-block;
                                                        background: rgba(0, 181, 181, 0.15);
                                                        color: #00B5B5;
                                                        padding: 6px 12px;
                                                        border-radius: 8px;
                                                        font-weight: 500;
                                                        margin-bottom: 12px;
                                                        font-size: 14px;
                                                    ">
                                                        ${place.safety_level}
                                                    </div>
                                                    
                                                    <p style="
                                                        margin: 0 0 15px; 
                                                        color: #666; 
                                                        font-size: 15px;
                                                        display: flex;
                                                        align-items: center;
                                                        gap: 6px;
                                                        cursor: pointer;
                                                    " onclick="window.open('https://maps.apple.com/?q=${encodeURIComponent(place.address)}', '_blank')">
                                                        📍 ${place.address}
                                                    </p>
                                                    
                                                    ${place.gf_criterias ? `
                                                        <div style="
                                                            display: flex;
                                                            flex-direction: column;
                                                            gap: 4px;
                                                            margin-bottom: 15px;
                                                            color: #666;
                                                            font-size: 14px;
                                                        ">
                                                            ${(() => {
                                                                const criteria = [];
                                                                const appliances = [];
                                                                
                                                                Object.entries(place.gf_criterias).forEach(([key, value]) => {
                                                                    if (value !== 'YES' || ['_id', 'step_id', 'created_at', 'in_vetting_process', 'based_on_user_reviews', 'checked_by_atly', 'celiac_friendly_override'].includes(key)) {
                                                                        return;
                                                                    }
                                                                    
                                                                    if (key.startsWith('separate_appliances_')) {
                                                                        const appliance = key.replace('separate_appliances_', '')
                                                                            .split('_')
                                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                            .join(' ')
                                                                            .replace('Pots Pans', 'Pots, Pans')
                                                                            .replace('Pots_pans', 'Pots, Pans');
                                                                        appliances.push(appliance);
                                                                    } else {
                                                                        const displayName = key
                                                                            .split('_')
                                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                            .join(' ')
                                                                            .replace('Pots Pans', 'Pots, Pans')
                                                                            .replace('Pots_pans', 'Pots, Pans');
                                                                        criteria.push(`<div>✓ ${displayName}</div>`);
                                                                    }
                                                                });
                                                                
                                                                if (appliances.length > 0) {
                                                                    criteria.push(`<div>✓ Separate Appliances: ${appliances.join(', ')}</div>`);
                                                                }
                                                                
                                                                return criteria.join('');
                                                            })()}
                                                        </div>
                                                    ` : ''}
                                                    
                                                    <div style="
                                                        display: flex; 
                                                        gap: 8px; 
                                                        flex-wrap: wrap; 
                                                        margin-bottom: 15px;
                                                    ">
                                                        ${(place.selected_tags || [])
                                                            .filter(tag => 
                                                                !tag.toLowerCase().includes('gf') &&
                                                                !tag.toLowerCase().includes('gluten') &&
                                                                !tag.toLowerCase().includes('celiac') &&
                                                                !tag.toLowerCase().includes('dedicated') &&
                                                                !tag.toLowerCase().includes('knowledgeable staff')
                                                            )
                                                            .slice(0, 5)
                                                            .map((tag, index) => {
                                                                const colors = [
                                                                    { bg: 'rgba(255, 87, 51, 0.1)', text: '#FF5733' },  // Coral
                                                                    { bg: 'rgba(126, 87, 194, 0.1)', text: '#7E57C2' }, // Purple
                                                                    { bg: 'rgba(0, 150, 136, 0.1)', text: '#009688' },  // Teal
                                                                    { bg: 'rgba(255, 152, 0, 0.1)', text: '#FF9800' },  // Orange
                                                                    { bg: 'rgba(233, 30, 99, 0.1)', text: '#E91E63' },  // Pink
                                                                    { bg: 'rgba(3, 169, 244, 0.1)', text: '#03A9F4' },  // Light Blue
                                                                    { bg: 'rgba(139, 195, 74, 0.1)', text: '#8BC34A' }, // Light Green
                                                                    { bg: 'rgba(103, 58, 183, 0.1)', text: '#673AB7' }  // Deep Purple
                                                                ];
                                                                const color = colors[index % colors.length];
                                                                return `
                                                                    <span style="
                                                                        background: ${color.bg};
                                                                        color: ${color.text};
                                                                        padding: 4px 12px;
                                                                        border-radius: 6px;
                                                                        font-size: 13px;
                                                                        font-weight: 500;
                                                                    ">${tag}</span>
                                                                `;
                                                            }).join('')}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>

                                        ${hiddenGem ? `
                                            <div style="
                                                background: rgba(255, 185, 0, 0.03);
                                                border-radius: 20px;
                                                padding: 20px;
                                                margin: 20px 0;
                                            ">
                                                <h3 style="
                                                    color: #FFB900; 
                                                    font-size: clamp(20px, 4vw, 24px); 
                                                    margin: 0 0 20px;
                                                ">
                                                    ✨ Hidden gem you might not know
                                                </h3>
                                                <div class="hidden-gem-card" style="
                                                    background: white;
                                                    border: 2px solid #FFB900;
                                                    border-radius: 12px;
                                                    padding: 20px;
                                                    box-shadow: 0 4px 15px rgba(255, 185, 0, 0.1);
                                                ">
                                                    <h3 style="
                                                        margin: 0 0 12px; 
                                                        color: #333; 
                                                        font-size: 24px;
                                                        font-weight: 600;
                                                    ">
                                                        ${hiddenGem.title}
                                                    </h3>
                                                    
                                                    <div style="
                                                        display: inline-block;
                                                        background: rgba(0, 181, 181, 0.15);
                                                        color: #00B5B5;
                                                        padding: 6px 12px;
                                                        border-radius: 8px;
                                                        font-weight: 500;
                                                        margin-bottom: 12px;
                                                        font-size: 14px;
                                                    ">
                                                        ${hiddenGem.safety_level}
                                                    </div>
                                                    
                                                    <p style="
                                                        margin: 0 0 15px; 
                                                        color: #666; 
                                                        font-size: 15px;
                                                        display: flex;
                                                        align-items: center;
                                                        gap: 6px;
                                                        cursor: pointer;
                                                    " onclick="window.open('https://maps.apple.com/?q=${encodeURIComponent(hiddenGem.address)}', '_blank')">
                                                        📍 ${hiddenGem.address}
                                                    </p>
                                                    
                                                    ${hiddenGem.gf_criterias ? `
                                                        <div style="
                                                            display: flex;
                                                            flex-direction: column;
                                                            gap: 4px;
                                                            margin-bottom: 15px;
                                                            color: #666;
                                                            font-size: 14px;
                                                        ">
                                                            ${(() => {
                                                                const criteria = [];
                                                                const appliances = [];
                                                                
                                                                Object.entries(hiddenGem.gf_criterias).forEach(([key, value]) => {
                                                                    if (value !== 'YES' || ['_id', 'step_id', 'created_at', 'in_vetting_process', 'based_on_user_reviews', 'checked_by_atly', 'celiac_friendly_override'].includes(key)) {
                                                                        return;
                                                                    }
                                                                    
                                                                    if (key.startsWith('separate_appliances_')) {
                                                                        const appliance = key.replace('separate_appliances_', '')
                                                                            .split('_')
                                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                            .join(' ')
                                                                            .replace('Pots Pans', 'Pots, Pans')
                                                                            .replace('Pots_pans', 'Pots, Pans');
                                                                        appliances.push(appliance);
                                                                    } else {
                                                                        const displayName = key
                                                                            .split('_')
                                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                            .join(' ')
                                                                            .replace('Pots Pans', 'Pots, Pans')
                                                                            .replace('Pots_pans', 'Pots, Pans');
                                                                        criteria.push(`<div>✓ ${displayName}</div>`);
                                                                    }
                                                                });
                                                                
                                                                if (appliances.length > 0) {
                                                                    criteria.push(`<div>✓ Separate Appliances: ${appliances.join(', ')}</div>`);
                                                                }
                                                                
                                                                return criteria.join('');
                                                            })()}
                                                        </div>
                                                    ` : ''}
                                                    
                                                    <div style="
                                                        display: flex; 
                                                        gap: 8px; 
                                                        flex-wrap: wrap; 
                                                        margin-bottom: 15px;
                                                    ">
                                                        ${(hiddenGem.selected_tags || [])
                                                            .filter(tag => 
                                                                !tag.toLowerCase().includes('gf') &&
                                                                !tag.toLowerCase().includes('gluten') &&
                                                                !tag.toLowerCase().includes('celiac') &&
                                                                !tag.toLowerCase().includes('dedicated') &&
                                                                !tag.toLowerCase().includes('knowledgeable staff')
                                                            )
                                                            .slice(0, 5)
                                                            .map((tag, index) => {
                                                                const colors = [
                                                                    { bg: 'rgba(255, 87, 51, 0.1)', text: '#FF5733' },  // Coral
                                                                    { bg: 'rgba(126, 87, 194, 0.1)', text: '#7E57C2' }, // Purple
                                                                    { bg: 'rgba(0, 150, 136, 0.1)', text: '#009688' },  // Teal
                                                                    { bg: 'rgba(255, 152, 0, 0.1)', text: '#FF9800' },  // Orange
                                                                    { bg: 'rgba(233, 30, 99, 0.1)', text: '#E91E63' },  // Pink
                                                                    { bg: 'rgba(3, 169, 244, 0.1)', text: '#03A9F4' },  // Light Blue
                                                                    { bg: 'rgba(139, 195, 74, 0.1)', text: '#8BC34A' }, // Light Green
                                                                    { bg: 'rgba(103, 58, 183, 0.1)', text: '#673AB7' }  // Deep Purple
                                                                ];
                                                                const color = colors[index % colors.length];
                                                                return `
                                                                    <span style="
                                                                        background: ${color.bg};
                                                                        color: ${color.text};
                                                                        padding: 4px 12px;
                                                                        border-radius: 6px;
                                                                        font-size: 13px;
                                                                        font-weight: 500;
                                                                    ">${tag}</span>
                                                                `;
                                                            }).join('')}
                                                    </div>
                                                </div>
                                            </div>
                                        ` : ''}

                                        <div style="
                                            text-align: center;
                                            padding: 24px 20px;
                                            background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(240, 30, 111, 0.03) 100%);
                                            border-radius: 24px;
                                            margin-top: 20px;
                                        ">
                                            <h3 style="
                                                font-size: 28px;
                                                font-weight: 600;
                                                color: #333;
                                                margin: 0 0 8px;
                                                line-height: 1.3;
                                            ">
                                                Explore more gluten-free gems!
                                            </h3>
                                            <p style="
                                                font-size: 18px;
                                                color: #666;
                                                margin: 0 0 32px;
                                                max-width: 500px;
                                                margin-left: auto;
                                                margin-right: auto;
                                            ">
                                                Get access to our curated list of safe spots and discover amazing places to eat.
                                            </p>

                                            <div style="
                                                display: flex;
                                                gap: 16px;
                                                justify-content: center;
                                                flex-wrap: wrap;
                                            ">
                                                <button id="showAnotherGem" style="
                                                    min-width: 200px;
                                                    background: rgba(240, 30, 111, 0.1);
                                                    color: #F01E6F;
                                                    border: none;
                                                    padding: 16px 32px;
                                                    border-radius: 12px;
                                                    font-size: 16px;
                                                    font-weight: 600;
                                                    cursor: pointer;
                                                    transition: all 0.2s ease;
                                                    position: relative;
                                                    overflow: hidden;
                                                ">
                                                    <span style="position: relative; z-index: 1;">Show another gem!</span>
                                                </button>
                                                <button onclick="handleCheckout()" style="
                                                    min-width: 200px;
                                                    background: linear-gradient(45deg, #F01E6F, #EF6F5E);
                                                    color: white;
                                                    border: none;
                                                    padding: 16px 32px;
                                                    border-radius: 12px;
                                                    font-size: 16px;
                                                    font-weight: 600;
                                                    cursor: pointer;
                                                    transition: all 0.2s ease;
                                                    box-shadow: 0 4px 6px rgba(240, 30, 111, 0.2);
                                                    position: relative;
                                                    overflow: hidden;
                                                ">
                                                    <span style="position: relative; z-index: 1;">Get Full Access →</span>
                                                </button>
                                            </div>
                                        </div>

                                        <style>
                                            @media (max-width: 600px) {
                                                #showAnotherGem, button {
                                                    width: 100%;
                                                    min-width: unset;
                                                    padding: 18px 24px;
                                                    font-size: 18px;
                                                }
                                            }
                                            
                                            #showAnotherGem:hover {
                                                background: rgba(240, 30, 111, 0.15);
                                                transform: translateY(-2px);
                                            }
                                            
                                            button:hover {
                                                transform: translateY(-2px);
                                                box-shadow: 0 6px 12px rgba(240, 30, 111, 0.25);
                                            }
                                        </style>
                                    </div>
                                `;

                                // Add hover effects
                                const cards = container.querySelectorAll('.place-card, .hidden-gem-card');
                                cards.forEach(card => {
                                    card.addEventListener('mouseover', () => {
                                        card.style.transform = 'translateY(-5px)';
                                        card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
                                    });
                                    card.addEventListener('mouseout', () => {
                                        card.style.transform = 'translateY(0)';
                                        card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                    });
                                });

                                // Add hover effects for action buttons
                                const actionButtons = container.querySelectorAll('button');
                                actionButtons.forEach(button => {
                                    button.addEventListener('mouseover', () => {
                                        button.style.transform = 'scale(1.1)';
                                        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                                    });
                                    button.addEventListener('mouseout', () => {
                                        button.style.transform = 'scale(1)';
                                        button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                    });
                                });

                                const showAnotherGemBtn = container.querySelector('#showAnotherGem');
                                if (showAnotherGemBtn) {
                                    showAnotherGemBtn.addEventListener('click', async () => {
                                        // Remove the button immediately after click
                                        showAnotherGemBtn.style.display = 'none';
                                        
                                        // Create loading state
                                        const gemContainer = container.querySelector('.hidden-gem-card').parentElement;
                                        const originalContent = gemContainer.innerHTML;
                                        
                                        gemContainer.innerHTML = `
                                            <div style="
                                                text-align: center;
                                                padding: 40px;
                                                opacity: 0;
                                                transform: translateY(20px);
                                                animation: fadeInUp 0.5s forwards;
                                            ">
                                                <div class="gem-loader" style="
                                                    width: 80px;
                                                    height: 80px;
                                                    margin: 0 auto 20px;
                                                    position: relative;
                                                ">
                                                    <div style="
                                                        position: absolute;
                                                        width: 100%;
                                                        height: 100%;
                                                        border: 4px solid rgba(240, 30, 111, 0.1);
                                                        border-top-color: #F01E6F;
                                                        border-radius: 50%;
                                                        animation: gemSpin 1s linear infinite;
                                                    "></div>
                                                    <div style="
                                                        position: absolute;
                                                        top: 50%;
                                                        left: 50%;
                                                        transform: translate(-50%, -50%);
                                                        font-size: 24px;
                                                    ">✨</div>
                                                </div>
                                                <h3 style="
                                                    color: #F01E6F;
                                                    font-size: 20px;
                                                    margin: 0;
                                                ">Looking for another hidden gem...</h3>
                                            </div>
                                            <style>
                                                @keyframes gemSpin {
                                                    0% { transform: rotate(0deg); }
                                                    100% { transform: rotate(360deg); }
                                                }
                                                @keyframes fadeInUp {
                                                    from {
                                                        opacity: 0;
                                                        transform: translateY(20px);
                                                    }
                                                    to {
                                                        opacity: 1;
                                                        transform: translateY(0);
                                                    }
                                                }
                                                @keyframes slideIn {
                                                    from {
                                                        opacity: 0;
                                                        transform: translateX(50px);
                                                    }
                                                    to {
                                                        opacity: 1;
                                                        transform: translateX(0);
                                                    }
                                                }
                                            </style>
                                        `;

                                        // Wait for 5 seconds
                                        await new Promise(resolve => setTimeout(resolve, 5000));

                                        // Get a new hidden gem (excluding the current one)
                                        const newHiddenGem = getRandomHiddenGem(sortedPlaces, hiddenGem);

                                        if (!newHiddenGem) {
                                            // If no other gem is found, show a message
                                            gemContainer.innerHTML = `
                                                <div style="
                                                    text-align: center;
                                                    padding: 40px;
                                                    animation: fadeInUp 0.5s forwards;
                                                ">
                                                    <h3 style="color: #F01E6F; margin-bottom: 20px;">
                                                        That's our best hidden gem in this area!
                                                    </h3>
                                                    <button onclick="handleCheckout()" style="
                                                        background: linear-gradient(45deg, #F01E6F, #EF6F5E);
                                                        color: white;
                                                        border: none;
                                                        padding: 12px 24px;
                                                        border-radius: 12px;
                                                        font-size: 16px;
                                                        font-weight: 500;
                                                        cursor: pointer;
                                                        transition: all 0.2s ease;
                                                        box-shadow: 0 4px 6px rgba(240, 30, 111, 0.2);
                                                    ">
                                                        Get Full Access
                                                    </button>
                                                </div>
                                            `;
                                            return;
                                        }

                                        // Show the new gem with animation
                                        gemContainer.innerHTML = `
                                            <div style="animation: slideIn 0.5s forwards;">
                                                ${createHiddenGemCard(newHiddenGem)}
                                            </div>
                                        `;
                                    });
                                }

                                // Helper function to create hidden gem card HTML
                                function createHiddenGemCard(gem) {
                                    return `
                                        <div class="hidden-gem-card" style="
                                            background: white;
                                            border: 2px solid #FFB900;
                                            border-radius: 12px;
                                            padding: 20px;
                                            box-shadow: 0 4px 15px rgba(255, 185, 0, 0.1);
                                        ">
                                            <h3 style="
                                                margin: 0 0 12px; 
                                                color: #333; 
                                                font-size: 24px;
                                                font-weight: 600;
                                            ">
                                                ${gem.title}
                                            </h3>
                                            
                                            <div style="
                                                display: inline-block;
                                                background: rgba(0, 181, 181, 0.15);
                                                color: #00B5B5;
                                                padding: 6px 12px;
                                                border-radius: 8px;
                                                font-weight: 500;
                                                margin-bottom: 12px;
                                                font-size: 14px;
                                            ">
                                                ${gem.safety_level}
                                            </div>
                                            
                                            <p style="
                                                margin: 0 0 15px; 
                                                color: #666; 
                                                font-size: 15px;
                                                display: flex;
                                                align-items: center;
                                                gap: 6px;
                                                cursor: pointer;
                                            " onclick="window.open('https://maps.apple.com/?q=${encodeURIComponent(gem.address)}', '_blank')">
                                                📍 ${gem.address}
                                            </p>
                                            
                                            ${gem.gf_criterias ? `
                                                <div style="
                                                    display: flex;
                                                    flex-direction: column;
                                                    gap: 4px;
                                                    margin-bottom: 15px;
                                                    color: #666;
                                                    font-size: 14px;
                                                ">
                                                    ${(() => {
                                                        const criteria = [];
                                                        const appliances = [];
                                                        
                                                        Object.entries(gem.gf_criterias).forEach(([key, value]) => {
                                                            if (value !== 'YES' || ['_id', 'step_id', 'created_at', 'in_vetting_process', 'based_on_user_reviews', 'checked_by_atly', 'celiac_friendly_override'].includes(key)) {
                                                                return;
                                                            }
                                                            
                                                            if (key.startsWith('separate_appliances_')) {
                                                                const appliance = key.replace('separate_appliances_', '')
                                                                    .split('_')
                                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                    .join(' ')
                                                                    .replace('Pots Pans', 'Pots, Pans')
                                                                    .replace('Pots_pans', 'Pots, Pans');
                                                                appliances.push(appliance);
                                                            } else {
                                                                const displayName = key
                                                                    .split('_')
                                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                    .join(' ')
                                                                    .replace('Pots Pans', 'Pots, Pans')
                                                                    .replace('Pots_pans', 'Pots, Pans');
                                                                criteria.push(`<div>✓ ${displayName}</div>`);
                                                            }
                                                        });
                                                        
                                                        if (appliances.length > 0) {
                                                            criteria.push(`<div>✓ Separate Appliances: ${appliances.join(', ')}</div>`);
                                                        }
                                                        
                                                        return criteria.join('');
                                                    })()}
                                                </div>
                                            ` : ''}
                                            
                                            <div style="
                                                display: flex; 
                                                gap: 8px; 
                                                flex-wrap: wrap; 
                                                margin-bottom: 15px;
                                            ">
                                                ${(gem.selected_tags || [])
                                                    .filter(tag => 
                                                        !tag.toLowerCase().includes('gf') &&
                                                        !tag.toLowerCase().includes('gluten') &&
                                                        !tag.toLowerCase().includes('celiac') &&
                                                        !tag.toLowerCase().includes('dedicated') &&
                                                        !tag.toLowerCase().includes('knowledgeable staff')
                                                    )
                                                    .slice(0, 5)
                                                    .map((tag, index) => {
                                                        const colors = [
                                                            { bg: 'rgba(255, 87, 51, 0.1)', text: '#FF5733' },
                                                            { bg: 'rgba(126, 87, 194, 0.1)', text: '#7E57C2' },
                                                            { bg: 'rgba(0, 150, 136, 0.1)', text: '#009688' },
                                                            { bg: 'rgba(255, 152, 0, 0.1)', text: '#FF9800' },
                                                            { bg: 'rgba(233, 30, 99, 0.1)', text: '#E91E63' },
                                                            { bg: 'rgba(3, 169, 244, 0.1)', text: '#03A9F4' },
                                                            { bg: 'rgba(139, 195, 74, 0.1)', text: '#8BC34A' },
                                                            { bg: 'rgba(103, 58, 183, 0.1)', text: '#673AB7' }
                                                        ];
                                                        const color = colors[index % colors.length];
                                                        return `
                                                            <span style="
                                                                background: ${color.bg};
                                                                color: ${color.text};
                                                                padding: 4px 12px;
                                                                border-radius: 6px;
                                                                font-size: 13px;
                                                                font-weight: 500;
                                                            ">${tag}</span>
                                                        `;
                                                    }).join('')}
                                            </div>

                                            <button onclick="handleCheckout()" style="
                                                background: linear-gradient(45deg, #F01E6F, #EF6F5E);
                                                color: white;
                                                border: none;
                                                padding: 12px 24px;
                                                border-radius: 12px;
                                                font-size: 16px;
                                                font-weight: 500;
                                                cursor: pointer;
                                                transition: all 0.2s ease;
                                                box-shadow: 0 4px 6px rgba(240, 30, 111, 0.2);
                                                width: 100%;
                                                margin-top: 20px;
                                            ">
                                                Get Full Access
                                            </button>
                                        </div>
                                    `;
                                }

                            } catch (error) {
                                console.error('Error loading places:', error);
                                container.innerHTML = `
                                    <div style="text-align: center; padding: 40px;">
                                        <p style="color: #F01E6F; font-size: 18px;">
                                            Sorry, we encountered an error loading places. Please try again.
                                        </p>
                                    </div>
                                `;
                            }
                        }
                    });

                    console.log('Setup complete');
                } catch (error) {
                    console.error('Error during setup:', error);
                    errorMessage.textContent = 'Unable to load city search. Please try again.';
                    errorMessage.style.display = 'block';
                }
            })();
        }
    }
];

// Function to load places data
async function loadPlacesData() {
    if (placesData) return;
    
    try {
        const response = await fetch('GFE Places.json');
        if (!response.ok) {
            throw new Error('Failed to load places data');
        }
        placesData = await response.json();
        
        // Log places data for debugging
        console.log('Loaded places data:', placesData);
        
        // Check for New York places
        const nyPlaces = placesData.filter(place => 
            place.city && place.city.toLowerCase().includes('new york')
        );
        console.log('Found New York places:', nyPlaces);
        
        // Extract unique cities
        availableCities = new Set(placesData.map(place => place.city));
        console.log('Available cities:', Array.from(availableCities));
        console.log('Places data loaded successfully');
    } catch (error) {
        console.error('Error loading places data:', error);
        throw error;
    }
}

// Helper function to calculate distance between coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Store the submit function globally
window.submitPlaces = async () => {
    const submitButton = document.querySelector('#submit');
    if (submitButton) {
        submitButton.click();
    }
};

// Ensure handleCheckout is available for inline onclick handlers
if (!window.handleCheckout) {
    window.handleCheckout = function() {
        const checkoutInfo = selectCheckoutScreen();
        const email = localStorage.getItem('atly_user_email');
        const finalUrl = `${checkoutInfo.url}${email ? `?prefilled_email=${encodeURIComponent(email)}` : ''}`;
        trackQuizCheckout(checkoutInfo.variant, checkoutInfo.price);
        window.location.href = finalUrl;
    };
}

console.log('Quiz version J data loaded successfully'); 