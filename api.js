const CHECKOUT_URL = 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2';
const API_URL = 'https://api.steps.me/v1';

// Generate a random password
function generatePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function handleEmailSubmission(email) {
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
        
        const result = { 
            sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`,
            userId: signupData.user?._id
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