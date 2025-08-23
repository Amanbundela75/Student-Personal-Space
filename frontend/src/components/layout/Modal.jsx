// frontend/src/components/layout/Modal.jsx

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './Modal.css'; // We will create this file next

const Modal = ({ children, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
                    <FaTimes />
                </button>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;