import React from 'react';

/**
 * A confirmation modal with Yes / No buttons instead of window.confirm
 * @param {string} message - The message to display
 * @param {function} onConfirm - Function to call if user confirms
 * @param {function} onCancel - Function to call if user cancels
 */
function ConfirmModal({ message, onConfirm, onCancel }) {

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onCancel]);

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleBackdropClick}
            role="dialog"
            aria-labelledby="confirmModalTitle"
            aria-hidden="false"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-warning">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title" id="confirmModalTitle">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Warning
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onCancel}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex align-items-start">
                            <div className="text-warning me-3 fs-2">
                                <i className="bi bi-door-open"></i>
                            </div>
                            <div className="flex-grow-1">
                                <p className="mb-0 fw-bold">Are you sure you want to leave?</p>
                                <p className="mb-0 mt-2 text-muted">{message}</p>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onCancel}>
                            <i className="bi bi-x-lg me-2"></i>
                            No
                        </button>
                        <button className="btn btn-danger" onClick={onConfirm}>
                            <i className="bi bi-door-open me-2"></i>
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;