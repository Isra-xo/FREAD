import React from 'react';
import './Toast.css';

const Toast = ({ toasts = [] }) => {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <div className="toast-message">{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Toast;