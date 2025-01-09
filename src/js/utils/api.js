const CHECKOUT_URL = 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2';

// Use global isLocalhost if it exists, otherwise create it
if (typeof window.isLocalhost === 'undefined') {
    window.isLocalhost = window.location.hostname === 'localhost' || 
        window.location.hostname.includes('127.0.0.1') || 
        window.location.hostname.includes('192.168.') ||
        window.location.hostname.includes('::1');
}

// Use development URLs in local environment
if (typeof window.API_URL === 'undefined') {
    window.API_URL = 'https://api.steps.me/v1';  // Always use production API
}

if (typeof window.MAP_ID === 'undefined') {
    window.MAP_ID = 'CwX3l0tJjXE';
}

// Fetch best gluten-free places from the API
async function getBestGfPlaces(lat, lon, radius) {
    try {
        // Generate a fallback distinct_id if Mixpanel is not available or not initialized
        let distinct_id;
        try {
            distinct_id = window.mixpanel && typeof window.mixpanel.get_distinct_id === 'function' 
                ? window.mixpanel.get_distinct_id() 
                : 'test_' + Math.random().toString(36).substring(2, 15);
        } catch (e) {
            distinct_id = 'test_' + Math.random().toString(36).substring(2, 15);
        }
        window.distinct_id = distinct_id; // Store it for later use

        console.log('🔍 Making API request to:', `${window.API_URL}/autls/best-gf-places`);
        const response = await fetch(
            `${window.API_URL}/autls/best-gf-places?lat=${lat}&lon=${lon}&radius=${radius}&distinct_id=${distinct_id}&include_safety_criteria=true&include_details=true`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'app_platform': "landing_page",
                    'Origin': 'https://gluten-free-quiz.atly.com',
                    'app_version': '3.12.2.0P'
                },
                mode: 'cors',
                credentials: 'omit'
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch best GF places: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        // Add detailed logging of the first place to see its structure
        if (data.best_places && data.best_places.length > 0) {
            console.log('First place data structure:', {
                title: data.best_places[0].title,
                gf_criterias: data.best_places[0].gf_criterias,
                gf_identity_data: data.best_places[0].gf_identity_data,
                all_fields: Object.keys(data.best_places[0])
            });
        }
        return data;
    } catch (error) {
        console.error('Error fetching GF places:', error);
        throw error;
    }
}

// Make the function globally available
window.getBestGfPlaces = getBestGfPlaces;

// Generate a random password
function generatePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Create Branch.io link
async function createBranchLink(userId, authToken) {
    console.log('🔗 Creating Branch.io link for user:', userId);
    
    try {
        const url = encodeURI(`${window.API_URL}/autls/branch-links`);
        console.log('🔍 Making API request to:', url);
        const result = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'app_platform': "landing_page",
                'Origin': 'https://gluten-free-quiz.atly.com',
                'app_version': '3.12.2.0P',
                'Authorization': `Bearer ${authToken}`
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({
                reason: "quiz",
                get_login_token: true,
                campaign: "indirect_quiz",
                stage: "indirect_quiz",
                client_type: "landing_page",
                link_type: "map_store",
                use_mixpanel_merge: true,
                in_product_share_method: "LANDING_PAGE_MAP_PROFILE_SHARE",
                from_quiz_id: userId,
                distinct_id: userId,
                channel: document.referrer.includes(".google.") ? "paid_advertising" : "paid_advertising",
                data: {
                    map_id: window.MAP_ID,
                    conversion_tool: "Indirect",
                    product: "Indirect Quiz",
                    user_source: "paid_advertising",
                    auth_token: authToken,
                    user_id: userId,
                    auto_login: true
                }
            })
        });

        if (!result.ok) {
            const errorText = await result.text();
            throw new Error(`Branch link creation failed with status: ${result.status} - ${errorText}`);
        }

        const { link } = await result.json();
        console.log('✅ Branch link created:', link);
        return link;
    } catch (error) {
        console.error('❌ Error creating Branch link:', error);
        return null;
    }
}

// Make the function globally available
window.handleEmailSubmission = async function(email) {
    try {
        console.log('📧 Starting email submission for:', email);
        
        // Make the signup API call directly
        const signupUrl = `${window.API_URL}/signup`;
        console.log('👤 Making signup request to:', signupUrl);
        const signupResponse = await fetch(signupUrl, {
            method: "POST",
            body: JSON.stringify({
                email,
                password: generatePassword(),
                client_type: "landing_page",
                app_version: "3.12.2.0P",
                distinct_id: null
            }),
            headers: {
                'Content-Type': 'application/json',
                'app_platform': "landing_page",
                'Origin': 'https://gluten-free-quiz.atly.com',
                'app_version': '3.12.2.0P'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        console.log('📫 Signup response status:', signupResponse.status);
        
        if (signupResponse.status === 409) {
            console.log('ℹ️ User already exists, proceeding to checkout');
            return { 
                sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`
            };
        }
        
        if (!signupResponse.ok) {
            const errorText = await signupResponse.text();
            throw new Error(`Signup failed with status: ${signupResponse.status} - ${errorText}`);
        }

        const signupData = await signupResponse.json();
        console.log('✅ Signup successful:', signupData);
        
        // Store the user ID globally
        window.quizUserId = signupData.user?._id;

        // Identify the user in Mixpanel - this automatically reconciles with the current distinct ID
        if (window.quizUserId) {
            console.log('🔄 Identifying user in Mixpanel:', window.quizUserId);
            mixpanel.identify(window.quizUserId);
        }

        // Create Branch.io link for the new user
        const branchLink = await createBranchLink(signupData.user?._id, signupData.token);
        
        const result = { 
            sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`,
            userId: signupData.user?._id,
            branchLink
        };
        console.log('🎉 Final result:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Error:', error);
        // Always return a checkout URL even if there's an error
        return { 
            sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`
        };
    }
}