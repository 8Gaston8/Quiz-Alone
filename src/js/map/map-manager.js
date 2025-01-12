// Apple Maps configuration
const WORLD_CENTER = { latitude: 45, longitude: -30 }; // Centered to show US and Europe

// Continent boundaries for better marker distribution
const CONTINENTS = {
    northAmerica: {
        bounds: { minLat: 15, maxLat: 72, minLng: -168, maxLng: -52 },
        weight: 2
    },
    europe: {
        bounds: { minLat: 36, maxLat: 71, minLng: -11, maxLng: 40 },
        weight: 2
    },
    asia: {
        bounds: { minLat: -10, maxLat: 77, minLng: 40, maxLng: 180 },
        weight: 2
    },
    australia: {
        bounds: { minLat: -47, maxLat: -10, minLng: 110, maxLng: 180 },
        weight: 1.5
    },
    southAmerica: {
        bounds: { minLat: -56, maxLat: 15, minLng: -82, maxLng: -33 },
        weight: 1.5
    }
};

// Major city coordinates with high density
const MAJOR_CITIES = {
    // North America - Top 20 metro areas
    'new_york': { lat: 40.7128, lng: -74.0060, radius: 0.3, weight: 25 },
    'los_angeles': { lat: 34.0522, lng: -118.2437, radius: 0.3, weight: 20 },
    'chicago': { lat: 41.8781, lng: -87.6298, radius: 0.2, weight: 18 },
    'dallas': { lat: 32.7767, lng: -96.7970, radius: 0.2, weight: 15 },
    'houston': { lat: 29.7604, lng: -95.3698, radius: 0.2, weight: 15 },
    'toronto': { lat: 43.6532, lng: -79.3832, radius: 0.2, weight: 15 },

    // Europe - Major capitals and cities
    'london': { lat: 51.5074, lng: -0.1278, radius: 0.2, weight: 25 },
    'paris': { lat: 48.8566, lng: 2.3522, radius: 0.2, weight: 25 },
    'berlin': { lat: 52.5200, lng: 13.4050, radius: 0.2, weight: 20 },
    'madrid': { lat: 40.4168, lng: -3.7038, radius: 0.2, weight: 18 },
    'rome': { lat: 41.9028, lng: 12.4964, radius: 0.2, weight: 18 },
    'amsterdam': { lat: 52.3676, lng: 4.9041, radius: 0.1, weight: 15 },

    // Asia - Major metropolitan areas
    'tokyo': { lat: 35.6762, lng: 139.6503, radius: 0.3, weight: 25 },
    'seoul': { lat: 37.5665, lng: 126.9780, radius: 0.2, weight: 20 },
    'shanghai': { lat: 31.2304, lng: 121.4737, radius: 0.3, weight: 25 },
    'hong_kong': { lat: 22.3193, lng: 114.1694, radius: 0.1, weight: 20 },
    'singapore': { lat: 1.3521, lng: 103.8198, radius: 0.1, weight: 18 }
};

function isInCity(lat, lng) {
    for (const [name, city] of Object.entries(MAJOR_CITIES)) {
        const distance = Math.sqrt(
            Math.pow(lat - city.lat, 2) + 
            Math.pow(lng - city.lng, 2)
        );
        if (distance <= city.radius) {
            return { inCity: true, weight: city.weight };
        }
    }
    return { inCity: false, weight: 1 };
}

function isInContinent(lat, lng) {
    for (const [name, continent] of Object.entries(CONTINENTS)) {
        const { bounds, weight } = continent;
        if (lat >= bounds.minLat && lat <= bounds.maxLat &&
            lng >= bounds.minLng && lng <= bounds.maxLng) {
            return { inContinent: true, weight: weight };
        }
    }
    return { inContinent: false, weight: 0 };
}

// Cache for valid coordinates per region
const coordinateCache = {};
const BATCH_SIZE = 100; // Increased from 50 for better performance
const MARKER_ANIMATION_INTERVAL = 2; // Milliseconds between marker animations

// Add marker pool for reuse
const markerPool = {
    markers: [],
    get: function() {
        return this.markers.pop() || new mapkit.MarkerAnnotation(new mapkit.Coordinate(0, 0));
    },
    return: function(marker) {
        marker.visible = false;
        this.markers.push(marker);
    }
};

// Function to pre-generate valid coordinates for a region
function preGenerateCoordinates(region, count) {
    const validCoords = [];
    const bounds = {
        minLat: region.center.latitude - (region.span.latitudeDelta / 2),
        maxLat: region.center.latitude + (region.span.latitudeDelta / 2),
        minLng: region.center.longitude - (region.span.longitudeDelta / 2),
        maxLng: region.center.longitude + (region.span.longitudeDelta / 2)
    };

    while (validCoords.length < count) {
        const lat = bounds.minLat + (Math.random() * (bounds.maxLat - bounds.minLat));
        const lng = bounds.minLng + (Math.random() * (bounds.maxLng - bounds.minLng));
        
        const continentCheck = isInContinent(lat, lng);
        if (!continentCheck.inContinent || !isLikelyOnLand(lat, lng)) continue;

        const cityCheck = isInCity(lat, lng);
        validCoords.push({
            latitude: lat,
            longitude: lng,
            weight: cityCheck.inCity ? cityCheck.weight : continentCheck.weight
        });
    }
    return validCoords;
}

// Modified generateMarkersInBatches function with proper styling
function generateMarkersInBatches(regionKey, coords, startIndex, onComplete) {
    const markers = [];
    const endIndex = Math.min(startIndex + BATCH_SIZE, coords.length);
    
    // Use requestAnimationFrame for smoother marker generation
    const processNextBatch = (currentIndex) => {
        const batchEndIndex = Math.min(currentIndex + 10, endIndex);
        
        for (let i = currentIndex; i < batchEndIndex; i++) {
            const coord = coords[i];
            const marker = markerPool.get();
            
            const restaurantName = generateRestaurantName();
            const subtitle = generateSubtitle();
            
            const showNumber = Math.random() < (regionKey === 'newYork' ? 0.4 : 0.2);
            const glyphText = showNumber ? 
                (Math.floor(Math.random() * 300) + 50).toString() : 
                getEmojiForRestaurant(restaurantName);
            
            marker.coordinate = new mapkit.Coordinate(coord.latitude, coord.longitude);
            marker.title = restaurantName;
            marker.subtitle = subtitle;
            marker.color = SUBTITLE_COLORS[subtitle];
            marker.glyphText = glyphText;
            marker.displayPriority = Math.min(Math.max(showNumber ? 200 : coord.weight * 100, 0), 1000);
            marker.visible = false;
            marker.animates = true;
            marker.enabled = false;
            
            // Add bounce animation styles
            if (marker.element) {
                marker.element.style.cssText = `
                    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    transform: scale(0) translateY(20px);
                    will-change: transform;
                `;
            }
            
            markers.push(marker);
        }
        
        if (batchEndIndex < endIndex) {
            requestAnimationFrame(() => processNextBatch(batchEndIndex));
        } else {
            map.addAnnotations(markers);
            onComplete(markers);
        }
    };
    
    requestAnimationFrame(() => processNextBatch(startIndex));
}

// Global variables for map state
let map;
let currentRegionIndex = 0;
const regionMarkers = {};

// Initialize Apple Maps
function initializeMap() {
    try {
        console.log('Initializing map...');
        
        if (typeof mapkit === 'undefined') {
            console.error('MapKit JS not loaded');
            return;
        }

        // Initialize MapKit JS
        mapkit.init({
            authorizationCallback: function(done) {
                console.log('MapKit authorization callback triggered');
                const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname.includes('127.0.0.1') || 
                    window.location.hostname.includes('192.168.') ||
                    window.location.hostname.includes('::1');
                console.log('Hostname check:', {
                    hostname: window.location.hostname,
                    isLocalhost: isLocalhost
                });
                const mapKitToken = isLocalhost
                    ? 'eyJraWQiOiJDOU40VzlaQzdWIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI5N0FWNzZEVUQ0IiwiaWF0IjoxNzM2NjcyNDY1LCJleHAiOjE3MzczNTk5OTl9.w-2XlPIiwTcYjXtGSKvCpGFkFOV056gCElEheTj_e21l3EWNvUjcypQZPeKwPznkXi90Cxkxui7mkBRVgxyWwg'
                    : 'eyJraWQiOiJHUEtMQzdVV0NRIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI5N0FWNzZEVUQ0IiwiaWF0IjoxNzM1MDU0MDEzLCJvcmlnaW4iOiJnbHV0ZW4tZnJlZS1xdWl6LmF0bHkuY29tIn0.bfwG1VUJ-JzDBhP_WGPyUBreFHkjKKflcKn02Z7Oizb1FMkJTCNnKyrn740H_2rYes-iFiZeXPw5Dn1H2q3F_w';
                console.log('Using token for:', isLocalhost ? 'localhost' : 'production');
                done(mapKitToken);
            },
            language: "en"
        });
        console.log('MapKit initialized');

        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        console.log('Map container found:', {
            display: window.getComputedStyle(mapContainer).display,
            width: mapContainer.offsetWidth,
            height: mapContainer.offsetHeight,
            visibility: window.getComputedStyle(mapContainer).visibility
        });

        // Set position relative on map container
        mapContainer.style.position = 'relative';
        console.log('Set position relative on map container');

        // Create a new map instance
        console.log('Creating map instance...');
        map = new mapkit.Map('map-container', {
            center: new mapkit.Coordinate(REGIONS.northAmerica.center.latitude, REGIONS.northAmerica.center.longitude),
            showsCompass: mapkit.FeatureVisibility.Hidden,
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Hidden,
            showsZoomControl: false,
            isRotationEnabled: false,
            isScrollEnabled: false,
            isZoomEnabled: false,
            tintColor: "#00B5B5",
            showsMapTypeControl: false,
            annotationForCluster: null // Disable clustering
        });
        console.log('Map instance created');

        // Add legend overlay
        console.log('Adding legend overlay...');
        const legendHTML = `
            <div id="map-legend">
                <div class="title">Celiac Safety Level</div>
                <div class="legend-items">
                    <div class="legend-item">
                        <div class="legend-dot level-1"></div>
                        <span>100% Gluten-free</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot level-2"></div>
                        <span>Celiac Friendly</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot level-3"></div>
                        <span>Accommodating</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot level-4"></div>
                        <span>Gluten-free options</span>
                    </div>
                </div>
            </div>
        `;

        // Add legend to map container
        const legendContainer = document.createElement('div');
        legendContainer.innerHTML = legendHTML;
        mapContainer.appendChild(legendContainer.firstElementChild);
        console.log('Legend overlay added');

        // Set initial region to show North America
        console.log('Setting initial region...');
        const initialRegion = new mapkit.CoordinateRegion(
            new mapkit.Coordinate(REGIONS.northAmerica.center.latitude, REGIONS.northAmerica.center.longitude),
            new mapkit.CoordinateSpan(REGIONS.northAmerica.span.latitudeDelta, REGIONS.northAmerica.span.longitudeDelta)
        );
        map.region = initialRegion;
        console.log('Initial region set');

        // Start the map rotation and marker loading
        console.log('Starting map initialization...');
        preloadAllMarkers();
        startRotation();
        console.log('Map initialization complete');

    } catch (error) {
        console.error('Error initializing map:', error);
        console.error('Error details:', {
            mapkit: typeof mapkit !== 'undefined' ? {
                initialized: mapkit.initialized,
                version: mapkit.version,
                build: mapkit.build
            } : 'undefined',
            map: typeof map !== 'undefined' ? {
                exists: map !== null,
                hasElement: map && map.element !== null,
                childCount: map && map.element ? map.element.children.length : 0
            } : 'undefined',
            container: document.getElementById('map-container') ? {
                display: window.getComputedStyle(document.getElementById('map-container')).display,
                visibility: window.getComputedStyle(document.getElementById('map-container')).visibility,
                dimensions: {
                    width: document.getElementById('map-container').offsetWidth,
                    height: document.getElementById('map-container').offsetHeight
                }
            } : 'no container'
        });
    }
}

// Function to start the rotation
function startRotation() {
    console.log('Starting rotation...');
    // Wait 3 seconds before starting the rotation to show initial US view
    setTimeout(() => {
        rotateRegions(); // First rotation
        setInterval(rotateRegions, 4500); // Shorter interval between rotations
    }, 3000);
}

// Modified preloadAllMarkers function
function preloadAllMarkers() {
    console.log('Preloading markers...');
    // First load all non-city regions
    const mainRegions = ['northAmerica', 'europe', 'asia'];
    mainRegions.forEach(regionKey => {
        console.log(`Generating markers for ${regionKey}...`);
        const coords = preGenerateCoordinates(REGIONS[regionKey], 500); // Increased from 200
        coordinateCache[regionKey] = coords;
        generateMarkersInBatches(regionKey, coords, 0, (markers) => {
            regionMarkers[regionKey] = markers;
            console.log(`Showing markers for ${regionKey}...`);
            markers.forEach((marker, index) => {
                setTimeout(() => {
                    marker.visible = true;
                    if (marker.element) {
                        marker.element.style.transform = 'scale(1) translateY(0)';
                    }
                }, index * 5); // Faster initial appearance
            });
        });
    });

    // Pre-generate coordinates for cities but don't create markers yet
    ['newYork', 'london', 'paris', 'bangkok'].forEach(city => {
        console.log(`Pre-generating coordinates for ${city}...`);
        coordinateCache[city] = preGenerateCoordinates(REGIONS[city], 800); // Increased from 400
    });
}

// Optimize rotation animation
function animateToRegion(targetRegion) {
    const currentRegion = {
        center: {
            latitude: map.region.center.latitude,
            longitude: map.region.center.longitude
        },
        span: {
            latitudeDelta: map.region.span.latitudeDelta,
            longitudeDelta: map.region.span.longitudeDelta
        }
    };

    // Reduce animation steps and use RAF timing
    const ANIMATION_DURATION = 1000; // ms
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        
        // Optimize easing calculation
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const newCenter = {
            latitude: currentRegion.center.latitude + (targetRegion.center.latitude - currentRegion.center.latitude) * easeProgress,
            longitude: currentRegion.center.longitude + (targetRegion.center.longitude - currentRegion.center.longitude) * easeProgress
        };
        
        const newSpan = {
            latitudeDelta: currentRegion.span.latitudeDelta + (targetRegion.span.latitudeDelta - currentRegion.span.latitudeDelta) * easeProgress,
            longitudeDelta: currentRegion.span.longitudeDelta + (targetRegion.span.longitudeDelta - currentRegion.span.longitudeDelta) * easeProgress
        };
        
        // Use a single region update
        map.region = new mapkit.CoordinateRegion(
            new mapkit.Coordinate(newCenter.latitude, newCenter.longitude),
            new mapkit.CoordinateSpan(newSpan.latitudeDelta, newSpan.longitudeDelta)
        );
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Optimize marker cleanup with proper animation
function cleanupMarkers(regionKey) {
    if (regionMarkers[regionKey]) {
        regionMarkers[regionKey].forEach(marker => {
            if (marker.element) {
                marker.element.style.transform = 'scale(0) translateY(20px)';
            }
            setTimeout(() => {
                marker.visible = false;
                markerPool.return(marker);
            }, 200);
        });
        
        setTimeout(() => {
            map.removeAnnotations(regionMarkers[regionKey]);
            delete regionMarkers[regionKey];
        }, 500);
    }
}

// Modified rotateRegions function with proper rotation
let isAnimating = false;
function rotateRegions() {
    if (isAnimating) return;
    isAnimating = true;

    const rotationOrder = ['northAmerica', 'newYork', 'europe', 'london', 'paris', 'asia', 'bangkok'];
    currentRegionIndex = (currentRegionIndex + 1) % rotationOrder.length;
    const nextRegionKey = rotationOrder[currentRegionIndex];
    const prevRegionKey = rotationOrder[(currentRegionIndex + rotationOrder.length - 1) % rotationOrder.length];
    
    // Handle city markers visibility
    const cityRegions = ['newYork', 'london', 'paris', 'bangkok'];
    
    // If we're entering a city view
    if (cityRegions.includes(nextRegionKey)) {
        if (!regionMarkers[nextRegionKey] && coordinateCache[nextRegionKey]) {
            generateMarkersInBatches(nextRegionKey, coordinateCache[nextRegionKey], 0, markers => {
                regionMarkers[nextRegionKey] = markers;
                showMarkers(markers);
            });
        } else if (regionMarkers[nextRegionKey]) {
            showMarkers(regionMarkers[nextRegionKey]);
        }
    }
    
    // If we're leaving a city view
    if (cityRegions.includes(prevRegionKey)) {
        cleanupMarkers(prevRegionKey);
    }
    
    // Animate to next region
    animateToRegion(REGIONS[nextRegionKey]);
    
    setTimeout(() => {
        isAnimating = false;
    }, 1500);
}

// Optimized marker show function with proper animation
function showMarkers(markers) {
    markers.forEach((marker, index) => {
        setTimeout(() => {
            marker.visible = true;
            if (marker.element) {
                marker.element.style.transform = 'scale(1) translateY(0)';
            }
        }, index * MARKER_ANIMATION_INTERVAL);
    });
}

// Cuisine type to emoji mapping
const CUISINE_EMOJIS = {
    // Asian Cuisines
    'Thai': '🍜',
    'Sushi': '🍱',
    'Vietnamese': '🍜',
    'Korean': '🥢',
    'Japanese': '🍱',
    'Dim Sum': '🥟',
    'Ramen': '🍜',
    'Pho': '🥣',
    'Boba': '🧋',
    'Chinese': '🥡',
    
    // Latin & Mexican
    'Mexican': '🌮',
    'Taco': '🌮',
    'Brazilian': '🥘',
    'Peruvian': '🦪',
    'Empanada': '🥟',
    'Arepa': '🫓',
    'Pupusa': '🫓',
    
    // Mediterranean & Middle Eastern
    'Mediterranean': '🥙',
    'Falafel': '🧆',
    'Greek': '🫔',
    'Turkish': '🥙',
    'Kebab': '🥩',
    'Hummus': '🫘',
    'Shawarma': '🥙',
    
    // Indian & South Asian
    'Indian': '🍛',
    'Curry': '🍛',
    'Biryani': '🍚',
    'Dosa': '🫓',
    'Tandoori': '🍗',
    'Naan': '🫓',
    
    // Health Food
    'Health': '🥗',
    'Vegan': '🥬',
    'Raw': '🥗',
    'Salad': '🥗',
    'Juice': '🧃',
    'Smoothie': '🥤',
    'Acai': '🫐',
    'Poke': '🐟',
    
    // African & Caribbean
    'Ethiopian': '🥘',
    'Caribbean': '🍖',
    'Jamaican': '🍖',
    'African': '🥘',
    'Jollof': '🍚',
    
    // European
    'Italian': '🍝',
    'Pizza': '🍕',
    'French': '🥖',
    'German': '🥨',
    'Spanish': '🥘',
    'British': '🫖',
    
    // Other Specialties
    'Farm': '🌾',
    'Bakery': '🥐',
    'Ice Cream': '🍨',
    'Coffee': '☕️',
    'Breakfast': '🍳',
    'BBQ': '🍖',
    'Burger': '🍔',
    'Sandwich': '🥪',
    'Seafood': '🦞',
    'Steak': '🥩',
    'default': '🍽️'
};

function getEmojiForRestaurant(name) {
    for (const [cuisine, emoji] of Object.entries(CUISINE_EMOJIS)) {
        if (name.toLowerCase().includes(cuisine.toLowerCase())) {
            return emoji;
        }
    }
    return CUISINE_EMOJIS.default;
}

// Improved land detection with better ocean boundaries
function isLikelyOnLand(lat, lng) {
    // Major water bodies with enhanced precision
    if (
        // Atlantic Ocean (adjusted for better US coastal coverage)
        (lng > -60 && lng < -10 && lat < 20) || // South Atlantic
        (lng > -45 && lng < -10 && lat > 20 && lat < 35) || // Mid Atlantic
        (lng > -35 && lng < -10 && lat > 35 && lat < 60) || // North Atlantic
        
        // Pacific Ocean (adjusted for North American West Coast)
        (lng < -124.5 && lat > 32 && lat < 49) || // US West Coast
        (lng < -110.5 && lat > 23 && lat < 32) || // Mexican West Coast (mainland)
        (lng < -114 && lat > 22 && lat < 28) || // Gulf of California
        (lng < -130 && !(lat > 22 && lat < 49)) || // Rest of Eastern Pacific
        (lng > 165 || lng < -165) || // International Date Line region
        (lng > 140 && lat < 60 && lat > -60) || // Western Pacific
        
        // Indian Ocean
        (lat < -10 && lng > 40 && lng < 110) || // Southern Indian Ocean
        (lat < 25 && lng > 55 && lng < 95) || // Central Indian Ocean
        
        // Mediterranean Sea
        (lat > 30 && lat < 47 && lng > -6 && lng < 37 && 
         !(lat > 35 && lat < 45 && lng > 12 && lng < 19) && // Exclude Italy
         !(lat > 34 && lat < 42 && lng > 19 && lng < 29) && // Exclude Greece
         !(lat > 36 && lat < 40 && lng > -6 && lng < 3)) || // Exclude Spain
        
        // North Sea and Baltic Sea
        (lat > 51 && lat < 62 && lng > -4 && lng < 13 &&
         !(lat > 51 && lat < 55 && lng > -1 && lng < 2)) || // Exclude UK
        (lat > 53 && lat < 66 && lng > 13 && lng < 30 &&
         !(lat > 55 && lat < 65 && lng > 11 && lng < 19)) || // Exclude Sweden
        
        // Additional Seas
        // Black Sea
        (lat > 41 && lat < 47 && lng > 27 && lng < 42) ||
        // Caspian Sea
        (lat > 36 && lat < 47 && lng > 46 && lng < 55) ||
        // Red Sea
        (lat > 12 && lat < 30 && lng > 32 && lng < 44) ||
        // Persian Gulf
        (lat > 24 && lat < 30 && lng > 48 && lng < 57) ||
        
        // Arctic and Antarctic
        (lat > 78) || (lat < -65) ||
        
        // Major Lakes
        // Great Lakes (adjusted)
        (lat > 41.5 && lat < 49 && lng > -93 && lng < -76 && 
         !(lat > 40 && lat < 45 && lng > -80 && lng < -73)) || // Exclude NY area
        // Lake Baikal
        (lat > 51 && lat < 56 && lng > 103 && lng < 110) ||
        // Lake Victoria
        (lat > -3 && lat < 1 && lng > 32 && lng < 35)
    ) {
        return false;
    }
    return true;
}

// Color mapping for different subtitle types
const SUBTITLE_COLORS = {
    '100% gluten-free': '#00B5B5', // Bright teal - most safe option
    'Celiac friendly': '#00A3A3',   // Slightly darker teal
    'Accommodating': '#009191',     // Even darker teal
    'Gluten-free options': '#007F7F' // Darkest teal - least safe option
};

// Function to generate a random restaurant name with more variety
function generateRestaurantName() {
    const prefixes = ['The', '', 'Little', 'Big', 'Golden', 'Royal', 'Blue', 'Green', 'Fresh', 'Authentic'];
    const suffixes = ['House', 'Kitchen', 'Cafe', 'Restaurant', 'Bistro', 'Eatery', 'Spot', 'Place', 'Corner', 'Bar'];
    
    // Get a random cuisine type
    const cuisineTypes = Object.keys(CUISINE_EMOJIS).filter(type => type !== 'default');
    const cuisine = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
    
    // 30% chance to generate a number-based name instead
    if (Math.random() < 0.3) {
        const number = Math.floor(Math.random() * 200) + 1;
        return `${number} ${cuisine}`;
    }
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return prefix ? `${prefix} ${cuisine} ${suffix}` : `${cuisine} ${suffix}`;
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

const REGIONS = {
    northAmerica: {
        center: { latitude: 39.8283, longitude: -98.5795 },
        span: { latitudeDelta: 40, longitudeDelta: 60 }
    },
    newYork: {
        center: { latitude: 40.7831, longitude: -73.9712 },
        span: { latitudeDelta: 0.15, longitudeDelta: 0.2 }
    },
    europe: {
        center: { latitude: 54.5260, longitude: 15.2551 },
        span: { latitudeDelta: 35, longitudeDelta: 50 }
    },
    london: {
        center: { latitude: 51.5074, longitude: -0.1278 },
        span: { latitudeDelta: 0.15, longitudeDelta: 0.25 }
    },
    paris: {
        center: { latitude: 48.8566, longitude: 2.3522 },
        span: { latitudeDelta: 0.15, longitudeDelta: 0.25 }
    },
    asia: {
        center: { latitude: 34.0479, longitude: 100.6197 },
        span: { latitudeDelta: 45, longitudeDelta: 70 }
    },
    bangkok: {
        center: { latitude: 13.7563, longitude: 100.5018 },
        span: { latitudeDelta: 0.15, longitudeDelta: 0.25 }
    }
};

// Add event listener to initialize map when results are shown
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const resultsSection = document.getElementById('results');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log('Results section mutation:', mutation.target.classList.contains('active'));
            if (mutation.target.classList.contains('active')) {
                // Wait for the final state to be displayed
                setTimeout(() => {
                    const finalState = document.querySelector('.final-state');
                    const finalStateStyle = window.getComputedStyle(finalState);
                    console.log('Final state display:', finalStateStyle.display);
                    if (finalStateStyle.display !== 'none') {
                        console.log('Initializing map after final state display');
                        initializeMap();
                    }
                }, 3500); // Increased from 3000 to ensure it runs after the final state is displayed
            }
        });
    });

    observer.observe(resultsSection, {
        attributes: true,
        attributeFilter: ['class']
    });
}); 