const CHECKOUT_URL = 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2';
const API_URL = 'https://dev.steps.me/dev';

async function handleEmailSubmission(email) {
    try {
        // First API call - signup
        const signupResponse = await fetch(`${API_URL}/signup`, {
            method: "POST",
            body: JSON.stringify({
                email,
                password: self.crypto.randomUUID(),
                client_type: "landing_page",
            }),
            headers: {
                'Content-Type': 'application/json',
                app_platform: "landing_page",
            },
        });
        
        const signupData = await signupResponse.json();
        const userId = signupData.user?._id;
        
        // Return the direct checkout URL with the email parameter
        return { 
            sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`,
            userId 
        };
    } catch (error) {
        console.error('Error during quiz submission:', error);
        // If anything fails, fall back to the direct checkout URL with email
        return { sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}` };
    }
} 