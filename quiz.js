console.log('Loading quiz data...');

const quizData = [
    {
        question: "How often do you worry about gluten when dining out?",
        options: [
            "All the time",
            "Sometimes",
            "Rarely"
        ],
        funFact: "Celiac disease affects about 1% of the global population, but many cases go undiagnosed. Apps like Atly help users feel safer by highlighting verified gluten-free options."
    },
    {
        question: "What's your email address? (We'll save your progress)",
        options: [],
        type: "email",
        funFact: "Your email is safe with us! We'll use it to save your progress and send you personalized gluten-free recommendations."
    },
    {
        question: "What's your biggest challenge finding gluten-free spots?",
        options: [
            "Unclear menu labeling",
            "Lack of trusted reviews",
            "Time-consuming research"
        ],
        funFact: "Studies show that up to 50% of gluten-free restaurant menus contain errors, making trusted recommendations essential."
    },
    {
        question: "How do you discover new gluten-free places?",
        options: [
            "Search engines",
            "Friend recommendations",
            "Trial and error"
        ],
        funFact: "With Atly, you can discover gluten-free spots curated by people who share your needs, ensuring safe dining experiences."
    },
    {
        question: "Ever had a reaction from a 'gluten-free' menu item?",
        options: [
            "Yes, multiple times",
            "Yes, but rarely",
            "No, never"
        ],
        funFact: "Cross-contamination in kitchens is a common issue. Atly helps you find places that truly understand gluten-free safety."
    },
    {
        question: "How far would you travel for safe gluten-free food?",
        options: [
            "5-10 minutes",
            "20-30 minutes",
            "Over 30 minutes"
        ],
        funFact: "Atly allows you to explore gluten-free spots near and far, so you can plan ahead for your next meal."
    },
    {
        question: "What's your favorite type of cuisine?",
        options: [
            "Italian",
            "Asian",
            "American"
        ],
        funFact: "Atly offers filtering options by cuisine type, so you can satisfy your cravings safely."
    },
    {
        question: "Feel confident asking staff about gluten-free options?",
        options: [
            "Not really",
            "Sometimes",
            "Very confident"
        ],
        funFact: "Atly's user reviews include detailed feedback on staff knowledge and safety measures."
    },
    {
        question: "How often do you cook instead of eating out?",
        options: [
            "Almost always",
            "Sometimes",
            "Rarely"
        ],
        funFact: "Atly's verified gluten-free places let you confidently dine out without stress."
    },
    {
        question: "Struggle to find gluten-free spots while traveling?",
        options: [
            "Yes, always",
            "Sometimes",
            "Not really"
        ],
        funFact: "Atly's global map ensures you can find gluten-free spots wherever you go."
    },
    {
        question: "Ready to make gluten-free dining easier?",
        options: [
            "Yes, definitely!",
            "Tell me more",
            "Not sure yet"
        ],
        funFact: "Users report saving hours of research with Atly, finding safe gluten-free places in seconds!"
    }
];

console.log('Quiz data loaded successfully');

// Rest of the quiz logic remains the same... 