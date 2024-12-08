const CHECKOUT_URL = 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2';
const API_URL = 'https://api.steps.me/v1';
const MAP_ID = 'CwX3l0tJjXE';

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
        const url = encodeURI(`${API_URL}/autls/branch-links`);
        const result = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'app_platform': "landing_page",
                'Origin': 'http://gluten-free-quiz.atly.com',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                reason: "quiz",
                get_login_token: true,
                campaign: "indirect_quiz",
                stage: "indirect_quiz",
                client_type: "landing_page",
                link_type: "map_store",
                use_mixpanel_merge: true,
                in_product_share_method: "INDIRECT_QUIZ",
                from_quiz_id: userId,
                distinct_id: userId,
                channel: document.referrer.includes(".google.") ? "google" : "unknown",
                data: {
                    map_id: MAP_ID,
                    conversion_tool: "Indirect",
                    product: "Indirect Quiz",
                    user_source: "indirect_ads"
                }
            })
        });

        if (!result.ok) {
            throw new Error(`Branch link creation failed with status: ${result.status}`);
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
        console.log('👤 Attempting signup...');
        const signupResponse = await fetch(`${API_URL}/signup`, {
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
                'Origin': 'http://gluten-free-quiz.atly.com'
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
            throw new Error(`Signup failed with status: ${signupResponse.status}`);
        }
        
        const signupData = await signupResponse.json();
        console.log('✅ Signup successful:', signupData);
        
        // Store the user ID globally
        window.quizUserId = signupData.user?._id;

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