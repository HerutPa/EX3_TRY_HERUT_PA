import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Modal for displaying success messages
 *
 * @param {boolean} show - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {string} message - Message to display in the modal
 */
function SuccessModal({ show, onClose, message }) {
    return (
        <Modal show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>
                    <i className="bi bi-check-circle me-2"></i>
                    Success
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0 fs-5 text-center">{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={onClose}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SuccessModal;