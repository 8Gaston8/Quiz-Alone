// City validation and auto-suggestion
function createCitySelectionPage(questionData) {
    const container = document.createElement('div');
    container.className = 'city-selection-container';

    const subheading = document.createElement('p');
    subheading.textContent = questionData.subheading;
    subheading.className = 'city-selection-subheading';

    const inputContainer = document.createElement('div');
    inputContainer.className = 'city-input-container';

    const cityInput = document.createElement('input');
    cityInput.type = 'text';
    cityInput.placeholder = questionData.placeholder;
    cityInput.className = 'city-input';
    cityInput.autocomplete = 'off';

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-container hidden';

    const errorMessage = document.createElement('p');
    errorMessage.textContent = questionData.errorMessage;
    errorMessage.className = 'error-message hidden';

    const submitButton = document.createElement('button');
    submitButton.textContent = questionData.buttonText;
    submitButton.className = 'city-submit-button';
    submitButton.disabled = true;

    // Load places data and handle autocomplete
    let availableCities = new Set();
    let selectedCity = '';
    
    loadPlacesData().then(loaded => {
        if (loaded && placesData) {
            availableCities = new Set(placesData.map(place => place.city));
        }
    });

    // Add event listeners for validation and auto-suggestions
    cityInput.addEventListener('input', () => {
        const value = cityInput.value.trim();
        
        // Clear suggestions
        suggestionsContainer.innerHTML = '';
        
        if (value.length >= 2) {
            const matchingCities = Array.from(availableCities)
                .filter(city => city.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 5); // Limit to top 5 suggestions
            
            if (matchingCities.length > 0) {
                matchingCities.forEach(city => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'suggestion-item';
                    suggestion.textContent = city;
                    suggestion.addEventListener('click', () => {
                        cityInput.value = city;
                        selectedCity = city;
                        suggestionsContainer.classList.add('hidden');
                        submitButton.disabled = false;
                        errorMessage.classList.add('hidden');
                    });
                    suggestionsContainer.appendChild(suggestion);
                });
                suggestionsContainer.classList.remove('hidden');
            } else {
                suggestionsContainer.classList.add('hidden');
            }
        } else {
            suggestionsContainer.classList.add('hidden');
        }
        
        // Update submit button state
        submitButton.disabled = !availableCities.has(value);
        errorMessage.classList.toggle('hidden', value === '' || availableCities.has(value));
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!inputContainer.contains(event.target)) {
            suggestionsContainer.classList.add('hidden');
        }
    });

    submitButton.addEventListener('click', async () => {
        const cityValue = cityInput.value.trim();
        if (availableCities.has(cityValue)) {
            const resultsContainer = await showCityResults(cityValue);
            container.innerHTML = '';
            container.appendChild(resultsContainer);
        } else {
            errorMessage.classList.remove('hidden');
        }
    });

    // Add keyboard support
    cityInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter' && !submitButton.disabled) {
            event.preventDefault();
            const cityValue = cityInput.value.trim();
            const resultsContainer = await showCityResults(cityValue);
            container.innerHTML = '';
            container.appendChild(resultsContainer);
        }
    });

    inputContainer.appendChild(cityInput);
    inputContainer.appendChild(suggestionsContainer);
    inputContainer.appendChild(errorMessage);

    container.appendChild(subheading);
    container.appendChild(inputContainer);
    container.appendChild(submitButton);

    return container;
}

// Initialize placesData as a global variable if it doesn't exist
if (typeof window.placesData === 'undefined') {
    window.placesData = null;
}

async function loadPlacesData() {
    try {
        const response = await fetch('GFE Places.json');
        window.placesData = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading places data:', error);
        return false;
    }
}

function getPlacesByCity(city) {
    if (!placesData) return null;

    const cityPlaces = placesData.filter(place => 
        place.city.toLowerCase() === city.toLowerCase()
    );

    // Sort by total_recommendations to get most popular
    cityPlaces.sort((a, b) => b.total_recommendations - a.total_recommendations);

    // Get top 3 popular places
    const popularPlaces = cityPlaces.slice(0, 3);

    // Get hidden gem (least popular but safe)
    const hiddenGem = cityPlaces
        .filter(place => 
            (place.safety_level === "Celiac Friendly" || 
             place.safety_level === "100% Dedicated Gluten-Free") &&
            !popularPlaces.includes(place)
        )
        .sort((a, b) => a.total_recommendations - b.total_recommendations)[0];

    return {
        popularPlaces,
        hiddenGem
    };
}

function createPlaceCard(place, isHiddenGem = false) {
    const card = document.createElement('div');
    card.className = isHiddenGem ? 'hidden-gem' : 'place-card';

    const name = document.createElement('h3');
    name.className = 'place-name';
    name.textContent = place.name;

    const safety = document.createElement('p');
    safety.className = 'safety-level';
    safety.textContent = `Safety Level: ${place.safety_level}`;

    const tags = document.createElement('div');
    tags.className = 'tags';
    place.selected_tags.slice(0, 5).forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tags.appendChild(tagElement);
    });

    const address = document.createElement('p');
    address.className = 'address';
    address.textContent = place.address;

    const review = document.createElement('p');
    review.className = 'review';
    review.textContent = place.last_review ? place.last_review.split('.')[0] + '.' : '';

    card.appendChild(name);
    card.appendChild(safety);
    card.appendChild(tags);
    card.appendChild(address);
    card.appendChild(review);

    return card;
}

async function showCityResults(city) {
    const container = document.createElement('div');
    container.className = 'results-container';

    const header = document.createElement('div');
    header.className = 'results-header';

    const heading = document.createElement('h1');
    heading.textContent = `Safe Gluten-Free Spots in ${city}`;
    heading.className = 'results-heading';

    const subheading = document.createElement('p');
    subheading.textContent = 'Here are some popular places near you:';
    subheading.className = 'results-subheading';

    header.appendChild(heading);
    header.appendChild(subheading);

    // Load places data if not already loaded
    if (!placesData) {
        const loaded = await loadPlacesData();
        if (!loaded) {
            const error = document.createElement('p');
            error.textContent = 'Sorry, we could not load the places data. Please try again later.';
            error.style.color = '#e74c3c';
            container.appendChild(error);
            return container;
        }
    }

    const cityData = getPlacesByCity(city);
    if (!cityData || (cityData.popularPlaces.length === 0 && !cityData.hiddenGem)) {
        const noResults = document.createElement('p');
        noResults.textContent = 'Sorry, we could not find any gluten-free places in this city yet.';
        noResults.style.color = '#7f8c8d';
        container.appendChild(header);
        container.appendChild(noResults);
        return container;
    }

    const popularPlaces = document.createElement('div');
    popularPlaces.className = 'popular-places';

    cityData.popularPlaces.forEach(place => {
        popularPlaces.appendChild(createPlaceCard(place));
    });

    if (cityData.hiddenGem) {
        const hiddenGemSection = createPlaceCard(cityData.hiddenGem, true);
        const hiddenGemText = document.createElement('p');
        hiddenGemText.textContent = "And here's a hidden gem you might not know about:";
        hiddenGemText.style.marginBottom = '1rem';
        container.appendChild(hiddenGemText);
        container.appendChild(hiddenGemSection);
    }

    const footer = document.createElement('div');
    footer.className = 'results-footer';

    const cta = document.createElement('p');
    cta.textContent = 'Unlock hundreds more gluten-free spots with our app!';
    cta.className = 'cta-text';

    const subscribeButton = document.createElement('button');
    subscribeButton.textContent = 'Subscribe Now';
    subscribeButton.className = 'subscribe-button';
    subscribeButton.addEventListener('click', () => {
        const checkoutInfo = selectCheckoutScreen();
        const email = localStorage.getItem('atly_user_email');
        const finalUrl = `${checkoutInfo.url}${email ? `?prefilled_email=${encodeURIComponent(email)}` : ''}`;
        trackQuizCheckout(checkoutInfo.variant, checkoutInfo.price);
        window.location.href = finalUrl;
    });

    footer.appendChild(cta);
    footer.appendChild(subscribeButton);

    container.appendChild(header);
    container.appendChild(popularPlaces);
    container.appendChild(footer);

    return container;
} 