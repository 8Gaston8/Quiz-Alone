const CHECKOUT_URL = 'https://pay.atly.com/b/8wMeYN15Xb4ubEkfZ2';
const API_URL = 'https://dev.steps.me/dev';

async function handleQuizSubmission(email) {
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
        
        if (!userId) {
            console.error('Failed to get user ID from signup');
            return { sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}` };
        }
        
        // Second API call - create Stripe checkout session
        const checkoutResponse = await fetch(`${API_URL}/best/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                email,
                userId,
                sourceUrl: window.location.href,
                designVersion: "",
                flowName: "quiz",
                withTrial: true // Enable 7-day trial by default
            }),
        });
        
        const checkoutResults = await checkoutResponse.json();
        
        if (checkoutResults.sessionUrl) {
            // Store the transaction details if needed
            if (checkoutResults.transaction_id) {
                localStorage.setItem('atly-checkout-transaction-id', checkoutResults.transaction_id);
            }
            if (checkoutResults.purchase_value) {
                localStorage.setItem('atly-checkout-purchase-value', checkoutResults.purchase_value);
            }
            return { sessionUrl: checkoutResults.sessionUrl, userId };
        }
        
        // If anything fails, fall back to the direct checkout URL with email
        return { sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}` };
    } catch (error) {
        console.error('Error during quiz submission:', error);
        // If anything fails, fall back to the direct checkout URL with email
        return { sessionUrl: `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}` };
    }
} 