import React from 'react';

export function LoadingSpinner({ size = 'md', text = 'Caricamento...' }) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  return (
    <div className="empty-state">
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner-icon">⏳</div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
