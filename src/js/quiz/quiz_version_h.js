console.log('Loading quiz version H data...');

const quizDataH = [
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
    }
];

const valuePropositionsH = {
    features: [
        {
            title: "Filter by safety levels",
            description: "Restaurants, bakeries and cafe's are organized by their level of celiac awareness and gluten-free options. Find places that match your criteria so you can eat out with confidence."
        },
        {
            title: "Reduce your gluten-free research",
            description: "Vetted information about every place's celiac accommodations, methods to avoid cross-contamination, and gluten-free options."
        },
        {
            title: "Location-based search",
            description: "Find gluten-free spots by location, so you can quickly see what options are around you or what's in the area you're going to be in. Decrease the time you spend planning where to eat."
        },
        {
            title: "Built with dieticians and celiac experts",
            description: "We equip you with important information about each place to reduce the possibilities of getting sick or going hungry."
        },
        {
            title: "320K+ reviews by the celiac community",
            description: "See what people like you say about where they ate, so you can make an informed decision about where to eat. This app is designed for the celiac community. These are reviews you can trust."
        },
        {
            title: "Save for later",
            description: "Conveniently bookmark and save specific restaurants, bars, or cafés you want to try so you can plan in advance! Particularly useful for planning your trips."
        },
        {
            title: "Advanced food filters",
            description: "Search by cuisine, dining preferences, food type, place type, and other dietary restrictions so you can tailor your selection to your needs."
        }
    ],
    testimonials: [
        {
            quote: "I have been using it now for 3 months and it saves me so much research. Reduces the need to call and double check every time.",
            name: "Kenneth Meisel",
            status: "Gluten Intolerant"
        },
        {
            quote: "Finding places to eat used to be such a drag. Atly made it so much easier. Love it!",
            name: "Jane Grinberg",
            status: "Highly symptomatic celiac"
        },
        {
            quote: "I've discovered great options in my city I was not aware of. Highly recommend it if you are Celiac.",
            name: "Ann Stanley",
            status: "Asymptomatic Celiac"
        }
    ]
};

console.log('Quiz version H data loaded successfully'); 