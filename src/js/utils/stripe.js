// Load Stripe.js
const loadStripe = () => {
    return new Promise((resolve, reject) => {
        if (window.Stripe) {
            resolve(window.Stripe);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => resolve(window.Stripe);
        script.onerror = (err) => reject(new Error('Failed to load Stripe.js'));
        document.head.appendChild(script);
    });
};

// Initialize Stripe with your publishable key
let stripePromise = null;
const getStripe = async () => {
    if (!stripePromise) {
        const Stripe = await loadStripe();
        stripePromise = Stripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    }
    return stripePromise;
};

// API configuration - this will be your Vercel deployment URL after deploying Quiz-Alone-Server
const STRIPE_API_URL = 'https://quiz-alone-server.vercel.app';

// Function to create and redirect to Stripe Checkout
async function createCheckoutSession(priceId, email, couponId = null) {
    try {
        const stripe = await getStripe();
        
        // Create Checkout Session on the server
        const response = await fetch(`${STRIPE_API_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price_id: priceId,
                email: email,
                coupon: couponId,
                success_url: `${window.location.origin}/src/html/success.html`,
                cancel_url: window.location.href
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const { sessionId } = await response.json();

        // Redirect to Checkout using the session ID
        const result = await stripe.redirectToCheckout({
            sessionId: sessionId
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        // Fallback to default checkout URL if Stripe checkout fails
        const checkoutScreen = selectCheckoutScreen();
        window.location.href = `${checkoutScreen.url}?prefilled_email=${encodeURIComponent(email)}`;
    }
}

// Export the function for use in other files
window.createCheckoutSession = createCheckoutSession; 