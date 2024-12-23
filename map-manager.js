// Apple Maps configuration
const WORLD_CENTER = { latitude: 20, longitude: 0 }; // More central viewing point for the world

// Color mapping for different subtitle types
const SUBTITLE_COLORS = {
    '100% gluten-free': '#00B5B5', // Bright teal - most safe option
    'Celiac friendly': '#00A3A3',   // Slightly darker teal
    'Accommodating': '#009191',     // Even darker teal
    'Gluten-free options': '#007F7F' // Darkest teal - least safe option
};

// Function to generate random coordinates within reasonable bounds
function generateRandomCoordinate() {
    // Latitude: -85 to 85 (avoiding poles)
    // Longitude: -180 to 180
    const lat = (Math.random() * 170) - 85;
    const lng = (Math.random() * 360) - 180;
    return { latitude: lat, longitude: lng };
}

// Function to generate a random restaurant name
function generateRestaurantName() {
    const foodTypes = [
        // Asian Cuisine
        'Thai Kitchen',
        'Sushi Bar',
        'Vietnamese Pho',
        'Korean BBQ',
        'Rice Paper Rolls',
        'Pad Thai House',
        'Bibimbap House',
        'Spring Roll Kitchen',
        'Curry House',
        'Stir Fry Wok',
        'Rice Bowl Bar',
        'Banh Mi Corner',
        'Dim Sum Palace',
        'Japanese Grill',
        'Teriyaki Bowl',
        'Mongolian Grill',
        'Tempura House',
        'Yakitori Spot',
        'Ramen Bar',
        'Udon Kitchen',

        // Latin American
        'Mexican Grill',
        'Taco Joint',
        'Corn Tortilla Kitchen',
        'Pupuseria',
        'Arepa House',
        'Ceviche Bar',
        'Brazilian Grill',
        'Peruvian Kitchen',
        'Empanada Shop',
        'Tamale Kitchen',
        'Pozole House',
        'Fajita Grill',
        'Enchilada Kitchen',
        'Guacamole Bar',
        'Salsa Kitchen',

        // Mediterranean & Middle Eastern
        'Mediterranean',
        'Falafel House',
        'Hummus Bar',
        'Kebab Grill',
        'Greek Kitchen',
        'Shawarma Spot',
        'Turkish Grill',
        'Mezze Bar',
        'Tahini Kitchen',
        'Lebanese Grill',
        'Israeli Kitchen',
        'Persian Palace',
        'Moroccan Tagine',
        'Egyptian Kitchen',

        // Indian & South Asian
        'Indian Curry House',
        'Dosa Corner',
        'Tandoori Grill',
        'Biryani House',
        'South Indian Kitchen',
        'North Indian Grill',
        'Masala Diner',
        'Thali House',
        'Chutney Bar',
        'Kerala Kitchen',
        'Punjab Palace',
        'Bengali Kitchen',
        'Sri Lankan Spot',
        'Nepali Kitchen',

        // Modern Health Food
        'Acai Bowl Bar',
        'Quinoa Bowl',
        'Poke Bar',
        'Buddha Bowl Bar',
        'Smoothie Kitchen',
        'Grain Bowl Shop',
        'Green Kitchen',
        'Power Bowl Bar',
        'Superfood Cafe',
        'Clean Eats Kitchen',
        'Fresh Bowl Bar',
        'Garden Bowl',
        'Harvest Bowl',
        'Wellness Kitchen',
        'Protein Bowl Bar',

        // African & Caribbean
        'Ethiopian Kitchen',
        'Jollof Rice House',
        'Caribbean Grill',
        'Jamaican Kitchen',
        'West African Spot',
        'Plantain Kitchen',
        'Jerk Grill',
        'African Fusion',
        'Trinidadian Kitchen',
        'Curry Goat Spot',

        // Specialty & Fusion
        'Farm to Table',
        'Raw Food Kitchen',
        'Paleo Grill',
        'Keto Kitchen',
        'Whole30 Spot',
        'Root Kitchen',
        'Seasonal Bowl',
        'Local Harvest',
        'Pure Kitchen',
        'Earth Bowl',
        'Fusion Bowl',
        'World Kitchen',
        'Global Eats',
        'Street Food Kitchen',
        'Market Fresh Grill'
    ];
    return foodTypes[Math.floor(Math.random() * foodTypes.length)];
}

// Function to generate a random subtitle
function generateSubtitle() {
    const subtitles = [
        '100% gluten-free',
        'Celiac friendly',
        'Accommodating',
        'Gluten-free options'
    ];
    return subtitles[Math.floor(Math.random() * subtitles.length)];
}

// Initialize Apple Maps
function initializeMap() {
    // Only initialize map for version G
    if (currentQuizVersion !== 'Aha_Quiz') {
        return;
    }

    // Initialize MapKit JS
    mapkit.init({
        authorizationCallback: function(done) {
            // You would typically make an API call to your server to get a token
            const mapKitToken = 'YOUR_MAPKIT_TOKEN';
            done(mapKitToken);
        }
    });

    // Create a new map instance
    const map = new mapkit.Map('map-container', {
        center: new mapkit.Coordinate(WORLD_CENTER.latitude, WORLD_CENTER.longitude),
        zoom: 1, // Maximum zoom out to see most of the world
        showsZoom: true,
        showsScale: true,
        showsCompass: mapkit.FeatureVisibility.Adaptive
    });

    // Create array to hold all annotations
    const annotations = [];

    // Generate 1000 random markers
    for (let i = 0; i < 1000; i++) {
        const coords = generateRandomCoordinate();
        const subtitle = generateSubtitle();
        const annotation = new mapkit.MarkerAnnotation(
            new mapkit.Coordinate(coords.latitude, coords.longitude),
            {
                title: generateRestaurantName(),
                subtitle: subtitle,
                animates: true,
                color: SUBTITLE_COLORS[subtitle] // Use color based on subtitle
            }
        );
        annotations.push(annotation);
    }

    // Add all annotations to the map
    map.addAnnotations(annotations);
}

// Add event listener to initialize map when results are shown
document.addEventListener('DOMContentLoaded', () => {
    const resultsSection = document.getElementById('results');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                // Wait for the final state to be displayed
                setTimeout(() => {
                    if (document.querySelector('.final-state').style.display === 'block') {
                        initializeMap();
                    }
                }, 3000);
            }
        });
    });

    observer.observe(resultsSection, {
        attributes: true,
        attributeFilter: ['class']
    });
}); 