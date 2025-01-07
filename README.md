# Quiz Application

## Project Structure

The project has been organized into the following directory structure for better maintainability and separation of concerns:

```
├── src/                  # Source code
│   ├── js/              # JavaScript files
│   │   ├── map/         # Map-related functionality
│   │   ├── quiz/        # Quiz versions and implementations
│   │   └── utils/       # Utility functions and core functionality
│   ├── css/             # Stylesheets
│   ├── html/            # HTML templates and pages
│   └── tests/           # Automated tests
│       ├── quiz/        # Quiz-specific tests
│       └── html/        # Test HTML pages
├── data/                # Data files (e.g., GFE Places.json)
└── config/              # Configuration files (package.json, vercel.json)
```

### Directory Contents

- `src/js/map/`: Contains files related to map functionality and city selection
  - `city-selection.js`: City selection interface
  - `map-manager.js`: Map management functionality

- `src/js/quiz/`: Contains different quiz versions and implementations
  - Multiple quiz version files (a through j)

- `src/js/utils/`: Core utilities and shared functionality
  - `api.js`: API integration
  - `intro_screens.js`: Introduction screens
  - `quiz-manager.js`: Quiz management
  - `script.js`: Main application script
  - `stripe.js`: Stripe payment integration
  - `tracking.js`: Analytics and tracking

- `src/css/`: Stylesheet files
  - `styles.css`: Main stylesheet
  - `modern-intro.css`: Modern UI styles for intro screens

- `src/html/`: HTML pages and templates
  - `index.html`: Main application page
  - `success.html`: Success page after quiz completion

- `src/tests/`: Automated test files
  - `quiz/`: Quiz-specific test files
    - `quiz-test-g.js`: Test suite for Quiz Version G
    - `quiz-test-j.js`: Test suite for Quiz Version J
  - `html/`: Test HTML pages
    - `city-test.html`: City selection testing page
    - `map-test.html`: Map functionality testing page

- `data/`: Data files
  - `GFE Places.json`: Geographic data for places

- `config/`: Configuration files
  - `package.json`: NPM package configuration
  - `vercel.json`: Vercel deployment configuration 