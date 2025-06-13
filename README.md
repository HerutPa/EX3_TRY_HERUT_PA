Exercise 3 – Word Guessing Game Application

Developers
Name: Herut Partner
Email: herutpa@edu.jmc.ac.il
Name: Nicole Kaznazav
Email: nicolekaz@edu.jmc.ac.il

========================================================================================================================
Scoring Rules - Word Guessing Game
Scoring Formula
The score is calculated according to a formula that takes into account speed, accuracy, and use of hints.
Score Components    לל

Base Score
1000 points for each victory
0 points if you didn't guess the word

Penalties (Score Deductions)
Time Penalty

-10 points per second over 30 seconds
Examples:
25 seconds → no penalty
35 seconds → penalty of 50 points (35-30) × 10
60 seconds → penalty of 300 points (60-30) × 10

Attempts Penalty
-50 points for each attempt over 3 attempts
Attempt = guessing a letter or guessing a complete word
Examples:
2 attempts → no penalty
5 attempts → penalty of 100 points (5-3) × 50
10 attempts → penalty of 350 points (10-3) × 50

Hint Penalty
-100 points if you used the hint
0 points if you didn't use the hint

Complete Calculation Formula
Final Score = 1000 - Time_Penalty - Attempts_Penalty - Hint_Penalty
Details:

Time_Penalty = max(0, (time_in_seconds - 30) × 10)
Attempts_Penalty = max(0, (number_of_attempts - 3) × 50)
Hint_Penalty = used_hint ? 100 : 0

Minimum Score:
50 points - the lowest score possible for a won game
0 points - if you didn't guess the word

========================================================================================================================








Design Patterns Used
1. Model-View-Controller (MVC) Pattern
   Description: Implemented through Spring Boot's layered architecture with Controllers, Services, and Repositories.
   Why Chosen: Separates concerns between data handling, business logic, and presentation layer, creating a well-structured backend architecture.
   Problem Solved: Eliminates tight coupling between different layers, making the code more maintainable and testable.
   Extensibility: New endpoints, business rules, or data sources can be added independently without affecting other layers.

2. Repository Pattern
   Description: Implemented through WordRepository and ScoreRepository classes that handle data persistence to binary files (.ser format).
   Why Chosen: Provides a clean abstraction layer between business logic and data storage, centralizing all file operations.
   Problem Solved: Isolates data access logic from business logic, making it easy to change storage mechanisms (e.g., from files to database) without affecting services.
   Extensibility: Storage can be easily migrated to databases, cloud storage, or other persistence mechanisms by only modifying repository implementations.

3. Service Layer Pattern
   Description: Business logic encapsulated in WordService and ScoreService classes, providing a clear separation between controllers and data access.
   Why Chosen: Centralizes business rules, validations, and complex operations in dedicated service classes.
   Problem Solved: Prevents code duplication, ensures consistent business logic application, and simplifies testing.
   Extensibility: New business rules, game mechanics, or scoring algorithms can be added to services without touching controllers or repositories.

4. Dependency Injection Pattern
   Description: Implemented through Spring's @Autowired annotation, automatically managing object dependencies.
   Why Chosen: Reduces coupling between classes and simplifies object lifecycle management.
   Problem Solved: Eliminates manual object creation and dependency management, making code more testable and maintainable.
   Extensibility: New dependencies can be easily injected without modifying existing classes, supporting flexible architecture evolution.

5. Component-Based Architecture (React)
   Description: Frontend built using React's component-based architecture with reusable UI components.
   Why Chosen: Promotes code reusability, maintainability, and clear separation of UI concerns.
   Problem Solved: Reduces code duplication, improves development efficiency, and enhances user interface consistency.
   Extensibility: New UI features can be added as independent components, and existing components can be easily modified or extended.

   
Application Structure
Component Organization

Pages: High-level components corresponding to routes (HomePage, CitiesPage, AboutPage)
Components: Reusable UI elements (CityForm, CityList, FavoriteCities, WeatherForecast)
Context: Application state management (CityContext)
Services: Data access layer (cityService, weatherService)
Utils: Helper functions (validators, formatters)
Styles: CSS styles organized by component

Key Features
Core Game Functionality

Word Guessing Game: Players can guess letters or complete words
Multiple Categories: Words organized by categories (animals, colors, food, etc.)
Hint System: Optional hints available with score penalty
Timer: Real-time game timer with score impact
Score Calculation: Complex scoring algorithm considering time, attempts, and hint usage

