import React from "react";
import "./AlertDialog.css";

const AlertDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="alert-overlay">
      <div className="alert-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="alert-actions">
          <button className="alert-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="alert-button confirm" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
