import React from 'react';

export function EmptyState({ icon = '📭', message = 'Nessun dato disponibile' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-text">{message}</p>
    </div>
  );
}

export default EmptyState;
