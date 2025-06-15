import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/modals/ConfirmModal';
import useGameTimer from '../hooks/useGameTimer';
import useApi from '../hooks/useApi';

/**
 * Main game page - עם Custom Hooks
 * משתמש ב-useGameTimer לניהול הזמן ו-useApi לשמירת תוצאות
 */
function GamePage({ showError, clearError }) {
    const location = useLocation();
    const navigate = useNavigate();
    const api = useApi();

    // נתוני משחק מדף הבית
    const gameData = location.state;

    // בדיקה שיש נתוני משחק
    useEffect(() => {
        if (!gameData || !gameData.word) {
            if (showError) {
                showError('No game data found. Please start a new game.');
            }
            navigate('/');
        }
    }, [gameData, navigate, showError]);

    // נתוני משחק בסיסיים
    const [targetWord] = useState(gameData?.word?.toLowerCase() || '');
    const [hint] = useState(gameData?.hint || '');
    const [category] = useState(gameData?.category || '');
    const [nickname] = useState(gameData?.nickname || '');

    // מצב התקדמות המשחק
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [currentGuess, setCurrentGuess] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'saving', 'saved'
    const [usedHint, setUsedHint] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [savedScore, setSavedScore] = useState(null);

    // מצב UI
    const [inputMode, setInputMode] = useState('letter'); // 'letter' / 'word'
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // שימוש ב-useGameTimer Custom Hook
    const gameStartTime = Date.now();
    const {
        gameTime,
        formatTime,
        stopTimer,
        calculateTimePenalty
    } = useGameTimer(gameStatus === 'playing', gameStartTime);

    /**
     * שמירה אוטומטית של התוצאה כאשר המשחק מסתיים
     */
    useEffect(() => {
        if (gameStatus === 'won') {
            handleAutoSaveScore();
        }
    }, [gameStatus]);

    /**
     * חישוב המילה המוצגת עם האותיות שנוחשו
     */
    const getDisplayWord = () => {
        return targetWord
            .split('')
            .map(letter => guessedLetters.has(letter) ? letter : '_')
            .join(' ');
    };

    /**
     * בדיקה האם הניחוש תקין
     */
    const isValidGuess = (guess) => {
        return guess && /^[a-zA-Z]+$/.test(guess);
    };

    /**
     * טיפול בניחוש אות בודדת
     */
    const handleLetterGuess = (letter) => {
        const lowerLetter = letter.toLowerCase();

        if (guessedLetters.has(lowerLetter)) {
            if (showError) {
                showError(`The letter "${letter}" has already been guessed!`);
            }
            return;
        }

        const newGuessedLetters = new Set([...guessedLetters, lowerLetter]);
        setGuessedLetters(newGuessedLetters);
        setAttempts(prev => prev + 1);

        // בדיקה האם המילה הושלמה
        const wordCompleted = targetWord.split('').every(letter => newGuessedLetters.has(letter));
        if (wordCompleted) {
            setGameStatus('won');
        }
    };

    /**
     * טיפול בניחוש מילה שלמה
     */
    const handleWordGuess = (word) => {
        const lowerWord = word.toLowerCase().trim();
        setAttempts(prev => prev + 1);

        if (lowerWord === targetWord) {
            setGameStatus('won');
            setGuessedLetters(new Set(targetWord.split('')));
        } else {
            if (showError) {
                showError(`The word "${word}" is incorrect, try again.`);
            }
        }
    };

    /**
     * טיפול בלחיצת מקש למניעת רווחים
     */
    const handleKeyPress = (e) => {
        if (e.key === ' ') {
            e.preventDefault();
            if (showError) {
                showError('Spaces are not allowed. Please enter only English letters.');
            }
            return;
        }
    };

    /**
     * ניקוי שגיאות כשהמשתמש מתחיל לפעול
     */
    const clearErrorsOnInteraction = () => {
        if (clearError) {
            clearError();
        }
    };

    /**
     * טיפול בשינוי ה-input עם אימות
     */
    const handleInputChange = (e) => {
        clearErrorsOnInteraction();
        const value = e.target.value;
        const cleanValue = value.replace(/\s/g, '');

        if (value !== cleanValue && showError) {
            showError('Spaces are not allowed. Please enter only English letters.');
        }

        setCurrentGuess(cleanValue);
    };

    /**
     * טיפול בשליחת ניחוש
     */
    const handleSubmitGuess = (e) => {
        e.preventDefault();
        clearErrorsOnInteraction();

        if (!currentGuess.trim() || !isValidGuess(currentGuess)) {
            if (showError) {
                showError('Please enter a valid letter or word (English letters only)');
            }
            return;
        }

        const guess = currentGuess.trim().toLowerCase();

        if (inputMode === 'letter' && guess.length === 1) {
            handleLetterGuess(guess);
        } else if (inputMode === 'word' && guess.length > 1) {
            handleWordGuess(guess);
        } else {
            if (showError) {
                showError('Please check the way you guessed - a single letter or a whole word.');
            }
            return;
        }

        setCurrentGuess('');
    };

    /**
     * שמירה אוטומטית של התוצאה עם useApi
     */
    const handleAutoSaveScore = async () => {
        try {
            setGameStatus('saving');

            // עצירת הטיימר וקבלת הזמן הסופי
            const finalTime = stopTimer();

            const gameResult = {
                nickname,
                gameTimeSeconds: finalTime,
                attemptCount: attempts,
                usedHint,
                category,
                wordGuessed: targetWord,
                won: true
            };

            // שליחת התוצאה לשרת עם useApi
            const scoreData = await api.post('http://localhost:8080/api/scores', gameResult);

            setSavedScore(scoreData);
            setGameStatus('saved');

        } catch (error) {
            console.error('Error saving result:', error);
            if (showError) {
                showError('The game has ended but the result cannot be saved. Please check the connection to the server.');
            }
            setGameStatus('saved'); // ממשיכים בכל מקרה
        }
    };

    /**
     * הצגת רמז (עם קנס בניקוד)
     */
    const handleShowHint = () => {
        clearErrorsOnInteraction();
        setUsedHint(true);
        setShowHint(true);
    };

    /**
     * יציאה מהמשחק וחזרה לדף הבית
     */
    const handleQuitGame = () => {
        clearErrorsOnInteraction();
        setShowConfirmModal(true);
    };

    const confirmQuit = () => {
        setShowConfirmModal(false);
        navigate('/');
    };

    const cancelQuit = () => {
        setShowConfirmModal(false);
    };

    /**
     * מעבר ללוח התוצאות עם התוצאה השמורה
     */
    const handleViewLeaderboard = () => {
        navigate('/leaderboard', {
            state: {
                justFinished: true,
                gameResult: savedScore
            }
        });
    };

    /**
     * התחלת משחק חדש
     */
    const handleNewGame = () => {
        navigate('/');
    };

    // אם אין נתוני משחק - לא מציגים כלום
    if (!gameData) {
        return (
            <div className="container py-5 text-center">
                <h3>Loading game...</h3>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container py-4" onClick={clearErrorsOnInteraction}>
            <div className="row justify-content-center">
                <div className="col-lg-8">

                    {/* פאנל מידע עליון */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-primary text-white">
                            <div className="row align-items-center text-center">
                                <div className="col-md-3">
                                    <h6 className="mb-0">
                                        <i className="bi bi-person me-2"></i>
                                        {nickname}
                                    </h6>
                                </div>
                                <div className="col-md-3">
                                    <h6 className="mb-0">
                                        <i className="bi bi-tag me-2"></i>
                                        {category}
                                    </h6>
                                </div>
                                <div className="col-md-3">
                                    <h6 className="mb-0">
                                        <i className="bi bi-clock me-2"></i>
                                        {formatTime()}
                                    </h6>
                                </div>
                                <div className="col-md-3">
                                    <h6 className="mb-0">
                                        <i className="bi bi-arrow-repeat me-2"></i>
                                        {attempts} attempts
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* תצוגת המילה */}
                    <div className="card shadow mb-4">
                        <div className="card-body text-center py-5">
                            <h1 className="display-3 fw-bold text-primary mb-4"
                                style={{letterSpacing: '0.5rem', fontFamily: 'monospace'}}>
                                {getDisplayWord()}
                            </h1>

                            {gameStatus === 'playing' && (
                                <p className="lead text-muted">
                                    Guess the word! ({targetWord.length} letters)
                                </p>
                            )}

                            {gameStatus === 'saving' && (
                                <div className="alert alert-info">
                                    <h4 className="alert-heading">
                                        <i className="bi bi-trophy me-2"></i>
                                        Well done! You guessed it right!
                                    </h4>
                                    <p className="mb-0">
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Saving your score...
                                    </p>
                                </div>
                            )}

                            {gameStatus === 'saved' && (
                                <div className="alert alert-success">
                                    <h4 className="alert-heading">
                                        <i className="bi bi-trophy me-2"></i>
                                        Congratulations! Game completed successfully!
                                    </h4>
                                    <p className="mb-2">
                                        You finished the game in {formatTime()} with {attempts} attempts
                                    </p>
                                    {savedScore && (
                                        <p className="mb-0">
                                            <strong>Your score: {savedScore.finalScore} points</strong>
                                            {savedScore.usedHint && <span className="badge bg-warning text-dark ms-2">Used hint</span>}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {gameStatus === 'playing' && (
                        <>
                            {/* פאנל ניחושים */}
                            <div className="card shadow mb-4">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">
                                        <i className="bi bi-input-cursor me-2"></i>
                                        Guess
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {/* בחירת סוג ניחוש */}
                                    <div className="btn-group mb-3 w-100" role="group">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="inputMode"
                                            id="letterMode"
                                            checked={inputMode === 'letter'}
                                            onChange={() => setInputMode('letter')}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="letterMode">
                                            <i className="bi bi-fonts me-2"></i>
                                            Guessing a letter
                                        </label>

                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="inputMode"
                                            id="wordMode"
                                            checked={inputMode === 'word'}
                                            onChange={() => setInputMode('word')}
                                        />
                                        <label className="btn btn-outline-success" htmlFor="wordMode">
                                            <i className="bi bi-chat-quote me-2"></i>
                                            Guessing a whole word
                                        </label>
                                    </div>

                                    {/* טופס ניחוש */}
                                    <form onSubmit={handleSubmitGuess}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={currentGuess}
                                                onChange={handleInputChange}
                                                onKeyPress={handleKeyPress}
                                                placeholder={
                                                    inputMode === 'letter'
                                                        ? 'Enter a single letter...'
                                                        : 'Enter a complete word...'
                                                }
                                                maxLength={inputMode === 'letter' ? 1 : targetWord.length + 5}
                                                style={{direction: 'ltr', textAlign: 'center', fontSize: '1.5rem'}}
                                                autoFocus
                                            />
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg"
                                                disabled={!currentGuess.trim()}
                                            >
                                                <i className="bi bi-send me-2"></i>
                                                Guess!
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* פאנל פעולות */}
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <div className="row g-3">
                                        {/* כפתור רמז */}
                                        <div className="col-md-4">
                                            {!showHint ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-warning w-100"
                                                    onClick={handleShowHint}
                                                >
                                                    <i className="bi bi-lightbulb me-2"></i>
                                                    Show hint (-100 points)
                                                </button>
                                            ) : (
                                                <div className="alert alert-warning mb-0">
                                                    <strong><i className="bi bi-lightbulb me-2"></i>Hint:</strong><br />
                                                    {hint}
                                                </div>
                                            )}
                                        </div>

                                        {/* כפתור יציאה */}
                                        <div className="col-md-4">
                                            <button
                                                type="button"
                                                className="btn btn-secondary w-100"
                                                onClick={handleQuitGame}
                                            >
                                                <i className="bi bi-door-open me-2"></i>
                                                Exit game
                                            </button>
                                        </div>

                                        {/* מעבר ללוח התוצאות */}
                                        <div className="col-md-4">
                                            <button
                                                type="button"
                                                className="btn btn-info w-100"
                                                onClick={() => navigate('/leaderboard')}
                                            >
                                                <i className="bi bi-trophy me-2"></i>
                                                Leaderboard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* אותיות שנוחשו */}
                            {guessedLetters.size > 0 && (
                                <div className="card shadow">
                                    <div className="card-header">
                                        <h6 className="card-title mb-0">
                                            <i className="bi bi-check-circle me-2"></i>
                                            Guessed letters ({guessedLetters.size})
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex flex-wrap gap-2">
                                            {Array.from(guessedLetters).sort().map(letter => (
                                                <span
                                                    key={letter}
                                                    className={`badge fs-6 ${
                                                        targetWord.includes(letter)
                                                            ? 'bg-success'
                                                            : 'bg-danger'
                                                    }`}
                                                    style={{padding: '0.5rem'}}
                                                >
                                                    {letter.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* כפתורי משחק שהסתיים */}
                    {gameStatus === 'saved' && (
                        <div className="text-center">
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className="btn btn-success btn-lg"
                                    onClick={handleViewLeaderboard}
                                >
                                    <i className="bi bi-trophy me-2"></i>
                                    View Leaderboard
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg"
                                    onClick={handleNewGame}
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    New Game
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Modal אישור */}
                    {showConfirmModal && (
                        <ConfirmModal
                            message="The score will not be saved."
                            onConfirm={confirmQuit}
                            onCancel={cancelQuit}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}

export default GamePage;