import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Home page - the entry point to the game
 * Allows the player to enter a nickname, choose a category and start a game
 * Loads the list of categories from the server dynamically
 *
 * @param {function} showError Function to display global errors
 */
function HomePage({ showError }) {
    const navigate = useNavigate();

    // Form State
    const [nickname, setNickname] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);

    // loading and errors state
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [systemStatus, setSystemStatus] = useState({
        isReady: false,
        error: null,
        details: null
    });

    /**
     * Loads the category list from the server on page load
     * and on each page refresh as required by the assignment
     */
    useEffect(() => {
        loadSystemData();
    }, []);

    /**
     * Comprehensive system check - checks server, words file, and categories
     */
    const loadSystemData = async () => {
        try {
            setLoading(true);
            setSystemStatus({ isReady: false, error: null, details: null });

            // Step 1: Check if server is running
            let response;
            try {
                response = await fetch('http://localhost:8080/api/words/health');
            } catch (networkError) {
                throw new Error('SERVER_DOWN');
            }

            // Step 2: Check word system health
            if (!response.ok) {
                if (response.status === 503) {
                    // Service unavailable - word system not ready
                    try {
                        const healthData = await response.json();
                        throw new Error(`WORD_SYSTEM_ERROR: ${healthData.message || 'Word system not ready'}`);
                    } catch (jsonError) {
                        throw new Error('WORD_SYSTEM_ERROR: Word system not ready');
                    }
                } else {
                    throw new Error(`SERVER_ERROR: HTTP ${response.status}`);
                }
            }

            // Step 3: Get categories
            let categoriesResponse;
            try {
                categoriesResponse = await fetch('http://localhost:8080/api/words/categories');
            } catch (networkError) {
                throw new Error('CATEGORIES_FETCH_ERROR');
            }

            if (!categoriesResponse.ok) {
                if (categoriesResponse.status === 500) {
                    throw new Error('NO_WORDS_FILE');
                } else {
                    throw new Error(`CATEGORIES_ERROR: HTTP ${categoriesResponse.status}`);
                }
            }

            const categoriesData = await categoriesResponse.json();

            // Step 4: Validate categories data
            if (!Array.isArray(categoriesData)) {
                throw new Error('INVALID_CATEGORIES_DATA');
            }

            if (categoriesData.length === 0) {
                throw new Error('NO_CATEGORIES');
            }

            // Success! System is ready
            setCategories(categoriesData);
            setSelectedCategory(categoriesData[0]);
            setSystemStatus({
                isReady: true,
                error: null,
                details: null
            });

        } catch (error) {
            console.error('System check error:', error);
            handleSystemError(error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle different types of system errors with specific messages
     */
    const handleSystemError = (errorMessage) => {
        let userMessage = '';
        let details = '';
        let canRetry = true;

        if (errorMessage === 'SERVER_DOWN') {
            userMessage = 'Server is not responding';
            details = 'Please make sure the server is running.';
            canRetry = true;
        } else if (errorMessage.startsWith('WORD_SYSTEM_ERROR')) {
            userMessage = 'Word system is not ready';
            details = 'The words file is missing or empty.';
            canRetry = false;
        } else if (errorMessage === 'NO_WORDS_FILE') {
            userMessage = 'Word system is not ready';
            details = 'The words file is missing or empty.';
            canRetry = false;
        } else if (errorMessage === 'NO_CATEGORIES') {
            userMessage = 'Word system is not ready';
            details = 'The words file is missing or empty.';
            canRetry = false;
        } else if (errorMessage === 'CATEGORIES_FETCH_ERROR') {
            userMessage = 'Cannot load word categories';
            details = 'Network error while fetching categories. Please check your connection.';
            canRetry = true;
        } else if (errorMessage === 'INVALID_CATEGORIES_DATA') {
            userMessage = 'Invalid categories data received';
            details = 'The server returned invalid data. This might indicate a server-side issue.';
            canRetry = true;
        } else if (errorMessage.startsWith('SERVER_ERROR')) {
            userMessage = 'Server error occurred';
            details = `The server returned an error: ${errorMessage}. Please try again later.`;
            canRetry = true;
        } else {
            userMessage = 'Unknown system error';
            details = `Unexpected error: ${errorMessage}. Please contact support.`;
            canRetry = true;
        }

        setSystemStatus({
            isReady: false,
            error: userMessage,
            details: details,
            canRetry: canRetry
        });
    };

    /**
     * Validate form data
     * @returns {boolean} true if everything is correct
     */
    const validateForm = () => {
        const errors = {};

        // Nickname check
        if (!nickname.trim()) {
            errors.nickname = 'Please enter a nickname';
        } else if (nickname.trim().length < 2) {
            errors.nickname = 'The nickname must contain at least 2 characters.';
        } else if (nickname.trim().length > 20) {
            errors.nickname = 'The nickname cannot contain more than 20 characters.';
        } else if (!/^[a-zA-Z0-9\s]+$/.test(nickname.trim())) {
            errors.nickname = 'The nickname can only contain letters, numbers, and spaces.';
        }

        // Category check
        if (!selectedCategory) {
            errors.category = 'Please select a category';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handling the form submission and starting the game
     */
    const handleStartGame = async (e) => {
        e.preventDefault();

        // Reset previous errors
        setValidationErrors({});

        // Validation
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            // Final system check before starting game
            const healthResponse = await fetch('http://localhost:8080/api/words/health');
            if (!healthResponse.ok) {
                throw new Error('System became unavailable. Please refresh the page.');
            }

            // Attempt to draw a word from the selected category
            const wordResponse = await fetch(`http://localhost:8080/api/words/random/${selectedCategory}`);
            if (!wordResponse.ok) {
                if (wordResponse.status === 404) {
                    throw new Error(`The category "${selectedCategory}" is empty or no longer exists.`);
                }
                throw new Error('Unable to draw a word at the moment. Please try again.');
            }

            const randomWord = await wordResponse.json();

            // Go to the game page with the data
            navigate('/game', {
                state: {
                    nickname: nickname.trim(),
                    category: selectedCategory,
                    word: randomWord.word,
                    hint: randomWord.hint
                }
            });

        } catch (error) {
            console.error('Error starting the game:', error);
            showError(`Unable to start the game: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Refresh the system data (refresh button)
     */
    const handleRefreshSystem = () => {
        loadSystemData();
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8">

                    {/* Header */}
                    <div className="text-center mb-5">
                        <h1 className="display-4 fw-bold text-success mb-4">
                            Word Master
                        </h1>
                        <p className="lead text-dark">
                            Challenge yourself with our word guessing game
                        </p>
                    </div>

                    {/* Game Setup Form */}
                    <div className="card border-success shadow-lg">
                        <div className="card-header bg-success text-white">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-play-circle me-2"></i>
                                Start New Game
                            </h5>
                        </div>
                        <div className="card-body bg-light">

                            {loading ? (
                                // Loading screen
                                <div className="text-center py-4">
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">Checking system status...</p>
                                </div>
                            ) : !systemStatus.isReady ? (
                                // System error screen
                                <div className="text-center py-4">
                                    <div className="alert alert-danger">
                                        <h5 className="alert-heading">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {systemStatus.error}
                                        </h5>
                                        <p className="mb-3">{systemStatus.details}</p>

                                        {systemStatus.canRetry && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={handleRefreshSystem}
                                            >
                                                <i className="bi bi-arrow-clockwise me-2"></i>
                                                Try Again
                                            </button>
                                        )}

                                        {!systemStatus.canRetry && (
                                            <div className="mt-3">
                                                <p className="small text-muted">
                                                    Please contact the administrator to fix this issue.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Game form - only shown when system is ready
                                <form onSubmit={handleStartGame}>

                                    {/* Player nickname */}
                                    <div className="mb-4">
                                        <label htmlFor="nickname" className="form-label fw-bold text-dark">
                                            <i className="bi bi-person me-2"></i>
                                            Player Nickname:
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${validationErrors.nickname ? 'is-invalid' : ''}`}
                                            id="nickname"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="Enter your nickname..."
                                            maxLength={20}
                                            disabled={submitting}
                                        />
                                        {validationErrors.nickname && (
                                            <div className="invalid-feedback">
                                                {validationErrors.nickname}
                                            </div>
                                        )}
                                        <div className="form-text">
                                            Your nickname will appear on the leaderboard (2-20 characters)
                                        </div>
                                    </div>

                                    {/* Category selection */}
                                    <div className="mb-4">
                                        <label htmlFor="category" className="form-label fw-bold text-dark">
                                            <i className="bi bi-tags me-2"></i>
                                            Word Category:
                                        </label>
                                        <div className="input-group">
                                            <select
                                                className={`form-select ${validationErrors.category ? 'is-invalid' : ''}`}
                                                id="category"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                disabled={submitting}
                                            >
                                                <option value="">Choose category...</option>
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Refresh button */}
                                            <button
                                                type="button"
                                                className="btn btn-outline-success"
                                                onClick={handleRefreshSystem}
                                                disabled={submitting}
                                                title="Refresh categories"
                                            >
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>
                                        </div>

                                        {validationErrors.category && (
                                            <div className="invalid-feedback d-block">
                                                {validationErrors.category}
                                            </div>
                                        )}
                                    </div>

                                    {/* Start game button */}
                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-success btn-lg"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </span>
                                                    Starting game...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-play-fill me-2"></i>
                                                    Let's Play!
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default HomePage;