import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import useForm from '../hooks/useForm';

/**
 * Home page - עם Custom Hooks
 * משתמש ב-useApi לקריאות שרת ו-useForm לניהול הטופס
 */
function HomePage({ showError }) {
    const navigate = useNavigate();
    const api = useApi();

    // State עבור קטגוריות ומצב המערכת
    const [categories, setCategories] = useState([]);
    const [systemStatus, setSystemStatus] = useState({
        isReady: false,
        error: null,
        details: null,
        canRetry: true
    });

    // הגדרת חוקי אימות לטופס
    const validationRules = {
        nickname: {
            required: true,
            requiredMessage: 'Please enter a nickname',
            minLength: 2,
            minLengthMessage: 'The nickname must contain at least 2 characters',
            maxLength: 20,
            maxLengthMessage: 'The nickname cannot contain more than 20 characters',
            pattern: /^[a-zA-Z]+$/,
            patternMessage: 'The nickname can only contain English letters (a-z, A-Z) - no numbers, spaces, or special characters',
            custom: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Nickname is required';
                }

                const trimmedValue = value.trim();

                if (trimmedValue.length < 2) {
                    return 'Nickname must be at least 2 characters';
                }

                // בדיקה שיש רק אותיות אנגליות
                if (!/^[a-zA-Z]+$/.test(trimmedValue)) {
                    return 'Nickname can only contain English letters (a-z, A-Z). No numbers, spaces, Hebrew letters, or special characters allowed.';
                }

                return null;
            }
        },
        selectedCategory: {
            required: true,
            requiredMessage: 'Please select a category',
            custom: (value) => {
                if (!value || value === '') {
                    return 'You must choose a category';
                }
                return null;
            }
        }
    };

    // שימוש ב-useForm Custom Hook
    const {
        values,
        errors,
        handleChange,
        handleBlur,
        validate,
        reset: resetForm,
        isFieldInvalid
    } = useForm({
        nickname: '',
        selectedCategory: ''
    }, validationRules);

    /**
     * טיפול בשגיאות מערכת
     */
    const handleSystemError = useCallback((errorMessage) => {
        let userMessage = '';
        let details = '';
        let canRetry = true;

        if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
            userMessage = 'Server is not responding';
            details = 'Please make sure the server is running on http://localhost:8080';
            canRetry = true;
        } else if (errorMessage === 'NO_CATEGORIES') {
            userMessage = 'Word system is not ready';
            details = 'The words file is missing or empty. Please run the WordInit program first.';
            canRetry = false;
        } else if (errorMessage.includes('HTTP 503')) {
            userMessage = 'Word system is not ready';
            details = 'The words file is missing or empty.';
            canRetry = false;
        } else if (errorMessage.includes('HTTP 500')) {
            userMessage = 'Server error';
            details = 'Internal server error. Please contact the administrator.';
            canRetry = true;
        } else {
            userMessage = 'System error occurred';
            details = `Error: ${errorMessage}. Please try again later.`;
            canRetry = true;
        }

        setSystemStatus({
            isReady: false,
            error: userMessage,
            details: details,
            canRetry: canRetry
        });
    }, []);

    /**
     * טעינת נתוני המערכת עם useApi
     */
    const loadSystemData = useCallback(async () => {
        try {
            setSystemStatus({ isReady: false, error: null, details: null, canRetry: true });

            // בדיקת בריאות המערכת
            await api.get('http://localhost:8080/api/words/health');

            // טעינת קטגוריות
            const categoriesData = await api.get('http://localhost:8080/api/words/categories');

            if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
                throw new Error('NO_CATEGORIES');
            }

            // הצלחה!
            setCategories(categoriesData);
            handleChange('selectedCategory', categoriesData[0]);
            setSystemStatus({
                isReady: true,
                error: null,
                details: null,
                canRetry: true
            });

        } catch (error) {
            console.error('System check error:', error);
            handleSystemError(error.message);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api.get, handleChange, handleSystemError]);
    /**
     * טיפול בשליחת הטופס והתחלת משחק
     */
    const handleStartGame = async (e) => {
        e.preventDefault();

        // אימות הטופס - חובה לעצור אם יש שגיאות
        const isFormValid = validate();

        console.log('Form validation result:', isFormValid);
        console.log('Form values:', values);
        console.log('Form errors:', errors);

        if (!isFormValid) {
            console.log('Form validation failed - not proceeding to game');
            // הצגת הודעת שגיאה נוספת למשתמש
            if (errors.nickname) {
                showError(`Nickname error: ${errors.nickname}`);
            } else if (errors.selectedCategory) {
                showError(`Category error: ${errors.selectedCategory}`);
            } else {
                showError('Please fix the form errors before starting the game');
            }
            return; // עוצרים כאן אם יש שגיאות
        }

        // בדיקות נוספות שהערכים אכן תקינים
        const trimmedNickname = values.nickname.trim();

        if (!trimmedNickname) {
            showError('Please enter a valid nickname');
            return;
        }

        if (trimmedNickname.length < 2) {
            showError('Nickname must be at least 2 characters');
            return;
        }

        if (!/^[a-zA-Z]+$/.test(trimmedNickname)) {
            showError('Nickname can only contain English letters (a-z, A-Z). No numbers, spaces, Hebrew letters, or special characters allowed.');
            return;
        }

        if (!values.selectedCategory) {
            showError('Please select a category');
            return;
        }

        console.log('All validations passed - proceeding to game');

        try {
            // בדיקה אחרונה של המערכת
            await api.get('http://localhost:8080/api/words/health');

            // שליפת מילה אקראית
            const randomWord = await api.get(
                `http://localhost:8080/api/words/random/${values.selectedCategory}`
            );

            // וידוא שקיבלנו מילה תקינה
            if (!randomWord || !randomWord.word) {
                throw new Error('No word received from server');
            }

            console.log('Starting game with:', {
                nickname: trimmedNickname,
                category: values.selectedCategory,
                word: randomWord.word
            });

            // מעבר לדף המשחק רק אם הכל תקין
            navigate('/game', {
                state: {
                    nickname: trimmedNickname,
                    category: values.selectedCategory,
                    word: randomWord.word,
                    hint: randomWord.hint
                }
            });

        } catch (error) {
            console.error('Error starting game:', error);

            if (error.message.includes('404')) {
                showError(`The category "${values.selectedCategory}" is empty or no longer exists.`);
            } else {
                showError(`Unable to start the game: ${error.message}`);
            }
        }
    };

    const handleRefreshSystem = () => {
        api.clearError();
        resetForm();
        loadSystemData().catch(error => {
            console.error('Error refreshing system:', error);
        });
    };

    // טעינת נתונים ראשונית
    useEffect(() => {
        loadSystemData().catch(error => {
            console.error('Error loading system data:', error);
        });
    }, [loadSystemData]);

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

                            {api.loading ? (
                                // מסך טעינה
                                <div className="text-center py-4">
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">Checking system status...</p>
                                </div>
                            ) : !systemStatus.isReady ? (
                                // מסך שגיאת מערכת
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
                                                disabled={api.loading}
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
                                // טופס המשחק
                                <form onSubmit={handleStartGame}>

                                    {/* כינוי שחקן */}
                                    <div className="mb-4">
                                        <label htmlFor="nickname" className="form-label fw-bold text-dark">
                                            <i className="bi bi-person me-2"></i>
                                            Player Nickname:
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${isFieldInvalid('nickname') ? 'is-invalid' : ''}`}
                                            id="nickname"
                                            value={values.nickname}
                                            onChange={(e) => handleChange('nickname', e.target.value)}
                                            onBlur={() => handleBlur('nickname')}
                                            placeholder="Enter your nickname..."
                                            maxLength={20}
                                            disabled={api.loading}
                                            autoComplete="off"
                                        />
                                        {errors.nickname && (
                                            <div className="invalid-feedback">
                                                {errors.nickname}
                                            </div>
                                        )}
                                        <div className="form-text">
                                            Only English letters allowed (a-z, A-Z) - 2-20 characters
                                        </div>
                                    </div>

                                    {/* בחירת קטגוריה */}
                                    <div className="mb-4">
                                        <label htmlFor="category" className="form-label fw-bold text-dark">
                                            <i className="bi bi-tags me-2"></i>
                                            Word Category:
                                        </label>
                                        <div className="input-group">
                                            <select
                                                className={`form-select ${isFieldInvalid('selectedCategory') ? 'is-invalid' : ''}`}
                                                id="category"
                                                value={values.selectedCategory}
                                                onChange={(e) => handleChange('selectedCategory', e.target.value)}
                                                onBlur={() => handleBlur('selectedCategory')}
                                                disabled={api.loading}
                                            >
                                                <option value="">Choose category...</option>
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* כפתור רענון */}
                                            <button
                                                type="button"
                                                className="btn btn-outline-success"
                                                onClick={handleRefreshSystem}
                                                disabled={api.loading}
                                                title="Refresh categories"
                                            >
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>
                                        </div>

                                        {errors.selectedCategory && (
                                            <div className="invalid-feedback d-block">
                                                {errors.selectedCategory}
                                            </div>
                                        )}
                                    </div>

                                    {/* כפתור התחלת משחק */}
                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-success btn-lg"
                                            disabled={api.loading}
                                        >
                                            {api.loading ? (
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

                                        {/* הצגת שגיאות כלליות אם יש */}
                                        {(errors.nickname || errors.selectedCategory) && (
                                            <div className="alert alert-danger mt-3 mb-0">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                <strong>Cannot start game:</strong> Please fix the errors above.
                                            </div>
                                        )}
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