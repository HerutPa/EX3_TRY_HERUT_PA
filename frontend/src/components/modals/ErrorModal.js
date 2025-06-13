import React from 'react';

/**
 * Modal component to display errors instead of alert()
 * Displays an error message in a modern Bootstrap modal as required by the assignment
 *
 * @param {string} message The error message to display
 * @param {function} onClose A function to be called when the modal is closed
 */
function ErrorModal({ message, onClose }) {

    /**
     * Handles clicking on the backdrop to close the model
     */
    const handleBackdropClick = (e) => {
        // Close only if the backdrop is clicked and not the content
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    /**
     * Handling pressing the Escape key to close the model
     */
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        // Clearing the event listener when the component is destroyed
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <>
            {/* Backdrop dark */}
            <div
                className="modal fade show d-block"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={handleBackdropClick}
                role="dialog"
                aria-labelledby="errorModalTitle"
                aria-hidden="false"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-danger">

                        {/* Header of model */}
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title" id="errorModalTitle">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                error
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                                aria-label="close"
                            ></button>
                        </div>

                        {/* The content of the model */}
                        <div className="modal-body">
                            <div className="d-flex align-items-start">
                                {/* Error icon */}
                                <div className="text-danger me-3 fs-1">
                                    <i className="bi bi-x-circle"></i>
                                </div>

                                {/* Error massage */}
                                <div className="flex-grow-1">
                                    <p className="mb-0 fw-bold text-danger">
                                        An error occurred:
                                    </p>
                                    <p className="mb-0 mt-2">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ErrorModal;