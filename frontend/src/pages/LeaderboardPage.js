import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * The highscore table page
 * Displays the highs sorted by score, with the option to filter and search
 *
 * @param {function} showError Function to display global errors
 */
function LeaderboardPage({ showError }) {
    const location = useLocation();

    // State of the record data
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // State of filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [displayLimit, setDisplayLimit] = useState(10);
    const [categories, setCategories] = useState([]);

    // Checking if the player has arrived from the end of a game
    const justFinished = location.state?.justFinished;
    const gameResult = location.state?.gameResult;

    /**
     * Loading record data from the server
     */
    const loadLeaderboard = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            else setRefreshing(true);

            // Loading the leaderboard
            const response = await fetch(`http://localhost:8080/api/scores/leaderboard?limit=${displayLimit}`);
            if (!response.ok) {
                throw new Error('Unable to load the leaderboard.');
            }

            const data = await response.json();
            setLeaderboard(data);

            // Extracting unique categories
            const uniqueCategories = [...new Set(data.map(score => score.category))];
            setCategories(uniqueCategories);

        } catch (error) {
            console.error('Error loading records:', error);
            showError('The leaderboard cannot be loaded. Please check your connection to the server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Initial data loading
     */
    useEffect(() => {
        loadLeaderboard();
    }, [displayLimit]);

    /**
     * Filter records by search and category
     */
    const filteredLeaderboard = leaderboard.filter(score => {
        const matchesSearch = score.nickname.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || score.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    /**
     * Date Format
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Game time design
     */
    const formatGameTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    /**
     * Tag color by location
     */
    const getRankBadgeColor = (index) => {
        if (index === 0) return 'bg-warning text-dark';
        if (index === 1) return 'bg-secondary';
        if (index === 2) return 'bg-dark';
        return 'bg-primary';
    };

    /**
     * Icon by location
     */
    const getRankIcon = (index) => {
        if (index === 0) return 'bi-trophy-fill';
        if (index === 1) return 'bi-award-fill';
        if (index === 2) return 'bi-award';
        return 'bi-person-circle';
    };

    return (
        <div className="container py-4">

            {/* A congratulatory message for a game that has ended */}
            {justFinished && gameResult && (
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-8">
                        <div className={`alert ${gameResult.won ? 'alert-success' : 'alert-info'} alert-dismissible fade show`}>
                            <h5 className="alert-heading">
                                <i className={`bi ${gameResult.won ? 'bi-trophy' : 'bi-info-circle'} me-2`}></i>
                                {gameResult.won ? 'Game ended successfully!' : 'game over'}
                            </h5>
                            <p className="mb-2">
                                <strong>{gameResult.nickname}</strong> -
                                Score: <strong>{gameResult.finalScore}</strong> Points |
                                Time: <strong>{formatGameTime(gameResult.gameTimeSeconds)}</strong> |
                                Attempts: <strong>{gameResult.attemptCount}</strong>
                                {gameResult.usedHint && ' | Use a hint'}
                            </p>
                            <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Title and top controls */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h1 className="display-5 fw-bold text-primary">
                            <i className="bi bi-trophy me-3"></i>
                            Record table
                        </h1>

                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => loadLeaderboard(false)}
                                disabled={refreshing}
                            >
                                {refreshing ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                ) : (
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                )}
                                refreshing
                            </button>

                            <a href="/" className="btn btn-success">
                                <i className="bi bi-play-circle me-2"></i>
                                New Game
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter panel */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="row g-3 align-items-center">

                                {/* player search */}
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Player search:</label>
                                    <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter palyer name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Filter category */}
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">קטגוריה:</label>
                                    <select
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">All categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Number of results */}
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Results:</label>
                                    <select
                                        className="form-select"
                                        value={displayLimit}
                                        onChange={(e) => setDisplayLimit(Number(e.target.value))}
                                    >
                                        <option value={5}>5 superiors</option>
                                        <option value={10}>10 superiors</option>
                                        <option value={25}>25 superiors</option>
                                        <option value={50}>50 superiors</option>
                                        <option value={0}>All</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The record table */}
            <div className="row">
                <div className="col-12">
                    {loading ? (
                        // loading screen
                        <div className="text-center py-5">
                            <div className="sp loading screen inner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h5>Loading highscore table...</h5>
                        </div>
                    ) : filteredLeaderboard.length === 0 ? (
                        // No results
                        <div className="text-center py-5">
                            <i className="bi bi-emoji-frown display-1 text-muted mb-3"></i>
                            <h4 className="text-muted">No results to display.</h4>
                            <p className="text-muted">
                                {searchTerm || selectedCategory !== 'all'
                                    ? 'Try changing the filter or search.'
                                    : 'No results have been saved in the system yet.'
                                }
                            </p>
                            <a href="/" className="btn btn-primary">
                                <i className="bi bi-play-circle me-2"></i>
                                Start first game
                            </a>
                        </div>
                    ) : (
                        // record table
                        <div className="card shadow">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-primary">
                                    <tr>
                                        <th scope="col" className="text-center" style={{width: '80px'}}>
                                            <i className="bi bi-hash"></i>
                                        </th>
                                        <th scope="col">
                                            <i className="bi bi-person me-2"></i>
                                            Player
                                        </th>
                                        <th scope="col" className="text-center">
                                            <i className="bi bi-star me-2"></i>
                                            Score
                                        </th>
                                        <th scope="col" className="text-center">
                                            <i className="bi bi-clock me-2"></i>
                                            Time
                                        </th>
                                        <th scope="col" className="text-center">
                                            <i className="bi bi-arrow-repeat me-2"></i>
                                            Attempts
                                        </th>
                                        <th scope="col" className="text-center">
                                            <i className="bi bi-tag me-2"></i>
                                            Category
                                        </th>
                                        <th scope="col" className="text-center">
                                            <i className="bi bi-calendar me-2"></i>
                                            Date
                                        </th>
                                        <th scope="col" className="text-center">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Details
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredLeaderboard.map((score, index) => (
                                        <tr key={`${score.nickname}-${score.gameDate}`} className={index < 3 ? 'table-warning' : ''}>

                                            {/* Location */}
                                            <td className="text-center">
                          <span className={`badge ${getRankBadgeColor(index)} fs-6`}>
                            <i className={`bi ${getRankIcon(index)} me-1`}></i>
                              {index + 1}
                          </span>
                                            </td>

                                            {/* Player name */}
                                            <td>
                                                <div className="fw-bold">{score.nickname}</div>
                                                <small className="text-muted">
                                                    מילה: {score.wordGuessed}
                                                    {score.usedHint && (
                                                        <span className="badge bg-warning text-dark ms-2">User a hint</span>
                                                    )}
                                                </small>
                                            </td>

                                            {/* Score */}
                                            <td className="text-center">
                          <span className="fs-5 fw-bold text-success">
                            {score.finalScore.toLocaleString()}
                          </span>
                                                <div>
                                                    <small className="text-muted">Points</small>
                                                </div>
                                            </td>

                                            {/* Time */}
                                            <td className="text-center">
                          <span className="fw-bold">
                            {formatGameTime(score.gameTimeSeconds)}
                          </span>
                                                <div>
                                                    <small className="text-muted">Minutes: Seconds</small>
                                                </div>
                                            </td>

                                            {/* Attempts */}
                                            <td className="text-center">
                          <span className="badge bg-info fs-6">
                            {score.attemptCount}
                          </span>
                                            </td>

                                            {/* Category */}
                                            <td className="text-center">
                          <span className="badge bg-secondary">
                            {score.category}
                          </span>
                                            </td>

                                            {/* Date */}
                                            <td className="text-center">
                                                <small className="text-muted">
                                                    {formatDate(score.gameDate)}
                                                </small>
                                            </td>

                                            {/* More details */}
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-1">
                                                    {score.won && (
                                                        <i className="bi bi-check-circle-fill text-success" title="ניצח"></i>
                                                    )}
                                                    {score.gameTimeSeconds < 30 && (
                                                        <i className="bi bi-lightning-fill text-warning" title="מהיר!"></i>
                                                    )}
                                                    {score.attemptCount <= 3 && (
                                                        <i className="bi bi-bullseye text-primary" title="מדויק!"></i>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LeaderboardPage;