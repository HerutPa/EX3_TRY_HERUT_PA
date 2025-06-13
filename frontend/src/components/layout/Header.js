import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Header component with navigation menu
 * Displays all pages available in the application
 * Highlights the current page using useLocation
 */
function Header() {
    const location = useLocation();

    /**
     * Function to check if a particular route is the current one
     * @param {string} path the path to check
     * @returns {boolean} true if this is the current page
     */
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
            <div className="container">
                {/* Hamburger button for mobile */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation menu */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {/* Home page */}
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                                to="/"
                            >
                                <i className="bi bi-house-door me-1"></i>
                                Home
                            </Link>
                        </li>

                        {/* Leaderboard */}
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
                                to="/leaderboard"
                            >
                                <i className="bi bi-trophy me-1"></i>
                                Leaderboard
                            </Link>
                        </li>

                        {/* Word management */}
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                                to="/admin"
                            >
                                <i className="bi bi-gear me-1"></i>
                                Manage Words
                            </Link>
                        </li>

                        {/* About */}
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                                to="/about"
                            >
                                <i className="bi bi-info-circle me-1"></i>
                                About
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Header;