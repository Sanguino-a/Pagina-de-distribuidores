import { useEffect, useState } from 'react';

// Icon map for different toast types
const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

export default function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const entranceTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(entranceTimer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match the animation duration
  };

  const getIcon = () => iconMap[toast.type] || iconMap.info;

  return (
    <div
      className={`toast ${toast.type} ${isVisible && !isExiting ? 'toast-enter' : ''} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="toast-content">
        <span className="toast-icon" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="toast-message">{toast.message}</span>
      </div>
      <button
        className="toast-close"
        onClick={handleClose}
        aria-label="Cerrar notificación"
        type="button"
      >
        ×
      </button>
    </div>
  );
}