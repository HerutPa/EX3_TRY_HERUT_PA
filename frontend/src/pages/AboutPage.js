import React from 'react';

/**
 * Page about the game and the developers
 * Contains an explanation of the game, details of the presenters and the method of calculating the scores
 * As required in the assignment
 */
function AboutPage() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">

                    {/* page title */}
                    <div className="text-center mb-5">
                        <h1 className="display-4 fw-bold text-primary">
                            <i className="bi bi-info-circle me-3"></i>
                            About the game
                        </h1>
                        <hr className="w-25 mx-auto" />
                    </div>

                    {/* Explanation of the game */}
                    <div className="row mb-5">
                        <div className="col-md-8 mx-auto">
                            <div className="card shadow-sm">
                                <div className="card-header bg-primary text-white">
                                    <h3 className="card-title mb-0">
                                        <i className="bi bi-controller me-2"></i>
                                        Explanation of the game
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <p className="lead mb-3">
                                        It is an exciting word guessing game that combines Hangman and Wordle.
                                    </p>

                                    <h5 className="fw-bold text-primary mb-3">How do you play?</h5>
                                    <ul className="list-unstyled">
                                        <li className="mb-2">
                                            <i className="bi bi-1-circle text-primary me-2"></i>
                                            Choose a nickname and word category
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-2-circle text-primary me-2"></i>
                                            The system generates a word from the selected category.
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-3-circle text-primary me-2"></i>
                                            You can guess a single letter or the entire word.
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-4-circle text-primary me-2"></i>
                                            If necessary, you can get a hint (with a penalty on your score)
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-5-circle text-primary me-2"></i>
                                            The goal: to guess the word quickly and with a minimum of attempts.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Score calculation method */}
                    <div className="row mb-5">
                        <div className="col-md-8 mx-auto">
                            <div className="card shadow-sm">
                                <div className="card-header bg-success text-white">
                                    <h3 className="card-title mb-0">
                                        <i className="bi bi-calculator me-2"></i>
                                        Score calculation method
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <p className="mb-3">
                                        The score is calculated according to a formula that takes into account speed,
                                        accuracy, and use of hints:
                                    </p>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6 className="fw-bold text-success">Base score:</h6>
                                            <p className="mb-3">1000 points for each victory</p>

                                            <h6 className="fw-bold text-warning">Fines:</h6>
                                            <ul className="list-unstyled">
                                                <li className="mb-1">
                                                    <i className="bi bi-clock text-warning me-2"></i>
                                                    Time: -10 points per second over 30 seconds
                                                </li>
                                                <li className="mb-1">
                                                    <i className="bi bi-arrow-repeat text-warning me-2"></i>
                                                    Attempts: -50 points for each attempt over 3
                                                </li>
                                                <li className="mb-1">
                                                    <i className="bi bi-question-circle text-warning me-2"></i>
                                                    Hint: -100 points for using the hint
                                                </li>
                                            </ul>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The details of the submitters */}
                    <div className="row">
                        <div className="col-md-8 mx-auto">
                            <div className="card shadow-sm">
                                <div className="card-header bg-dark text-white">
                                    <h3 className="card-title mb-0">
                                        <i className="bi bi-people me-2"></i>
                                        The details of the submitters
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row text-center">
                                        <div className="col-md-6 mb-4">
                                            <div className="p-4">
                                                <i className="bi bi-person-circle display-4 text-primary mb-3 d-block"></i>
                                                <h5 className="fw-bold">Herut Partner</h5>
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <div className="p-4">
                                                <i className="bi bi-person-circle display-4 text-success mb-3 d-block"></i>
                                                <h5 className="fw-bold">Nicole Kazantsev</h5>
                                            </div>
                                        </div>
                                    </div>

                                    <hr />

                                    <div className="text-center">
                                        <h6 className="fw-bold mb-3">Project details</h6>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <i className="bi bi-calendar-event text-primary me-2"></i>
                                                <strong>Date:</strong> May 2025
                                            </div>
                                            <div className="col-md-4">
                                                <i className="bi bi-bookmark text-success me-2"></i>
                                                <strong>Exercise:</strong> Number 3
                                            </div>
                                            <div className="col-md-4">
                                                <i className="bi bi-code-slash text-warning me-2"></i>
                                                <strong>Technologies:</strong> React + Spring Boot
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* back button */}
                    <div className="text-center mt-5">
                        <a href="/" className="btn btn-primary btn-lg">
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to home page
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AboutPage;