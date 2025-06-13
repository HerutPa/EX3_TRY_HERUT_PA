import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// import של כל הדפים (נייצר אותם אחד אחד)
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import WordsPage from './pages/WordsPage';
import AboutPage from './pages/AboutPage';

// import של הרכיבים המשותפים
import Header from './components/layout/Header';
import ErrorModal from './components/modals/ErrorModal';

/**
 * The main component of the application
 * Defines the routing and general page structure
 *
 * Page structure:
 * / - Home page with nickname and category selection
 * /game - The game page itself
 * /leaderboard - Highscore table
 * /admin - Word management
 * /about - About the developers
 */
function App() {
  // Global state for errors that can happen anywhere
  const [globalError, setGlobalError] = React.useState(null);

  /**
   * Global error display function
   * Called from any component that needs to display an error
   */
  const showError = (message) => {
    setGlobalError(message);
  };

  /**
   * Function to close the error modal
   */
  const closeError = () => {
    setGlobalError(null);
  };

  /**
   * Function to clear errors (for auto-clearing when user performs new actions)
   */
  const clearError = () => {
    setGlobalError(null);
  };

  return (
      <Router>
        <div className="App min-vh-100 d-flex flex-column">
          {/* Fixed header on all pages */}
          <Header />

          {/* Main page content - will vary depending on the route */}
          <main className="flex-grow-1">
            <Routes>
              {/* Home page - Choose a nickname and category */}
              <Route
                  path="/"
                  element={<HomePage showError={showError} clearError={clearError} />}
              />

              {/* Game page */}
              <Route
                  path="/game"
                  element={<GamePage showError={showError} clearError={clearError} />}
              />

              {/* Record Table */}
              <Route
                  path="/leaderboard"
                  element={<LeaderboardPage showError={showError} clearError={clearError} />}
              />

              {/* Word Management */}
              <Route
                  path="/admin"
                  element={<WordsPage showError={showError} clearError={clearError} />}
              />

              {/* about Page */}
              <Route
                  path="/about"
                  element={<AboutPage />}
              />

              {/* Page 404 - If the path does not exist */}
              <Route
                  path="*"
                  element={
                    <div className="container text-center mt-5">
                      <h1 className="display-4">404</h1>
                      <p className="lead">The page you were looking for was not found.</p>
                      <a href="/" className="btn btn-primary">Back to home page</a>
                    </div>
                  }
              />
            </Routes>
          </main>

          {/* Modal for global errors */}
          {globalError && (
              <ErrorModal
                  message={globalError}
                  onClose={closeError}
              />
          )}
        </div>
      </Router>
  );
}

export default App;