import React from 'react';

const typeColors = {
  BOOKING_APPROVED: '#38bdf8',
  BOOKING_REJECTED: '#f43f5e',
  TICKET_UPDATED: '#f59e0b',
  COMMENT_ADDED: '#a855f7',
  GENERAL: '#22c55e',
};

export function NotificationItem({ notification, onMarkRead, onDelete }) {
  const badgeColor = typeColors[notification.type] || '#94a3b8';
  const created = new Date(notification.createdAt).toLocaleString();
  return (
    <div className="card">
      <div className="card-header">
        <span className="badge" style={{ backgroundColor: badgeColor }}>
          {notification.type}
        </span>
        <div className="card-actions">
          {!notification.read && (
            <button className="ghost" onClick={() => onMarkRead(notification.id)}>Mark read</button>
          )}
          <button className="ghost" onClick={() => onDelete(notification.id)}>Remove</button>
        </div>
      </div>
      <p className="card-message">{notification.message}</p>
      <div className="card-meta">
        <span>{created}</span>
        {notification.relatedEntityId && (
          <span className="muted">Related: {notification.relatedEntityId}</span>
        )}
      </div>
    </div>
  );
}
