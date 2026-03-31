import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';

export default function NotificationTray({ open, onClose }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    let alive = true;

    notificationApi
      .listMine()
      .then((res) => {
        if (!alive) return;
        setItems((res.data || []).slice(0, 6));
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
      });

    return () => {
      alive = false;
    };
  }, [open]);

  const onMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
    } catch {
      // Keep UI stable even if the backend call fails.
    }
  };

  if (!open) return null;

  return (
    <div className="tray">
      <div className="tray-header">
        <strong>Recent notifications</strong>
        <button className="link-btn" onClick={onClose}>Close</button>
      </div>
      <div className="tray-list">
        {items.length === 0 && <p className="muted">No notifications yet.</p>}
        {items.map((n) => (
          <article key={n.id} className={`tray-item ${n.isRead ? '' : 'is-unread'}`}>
            <h4>{n.title}</h4>
            <p>{n.message}</p>
            <div className="tray-item-actions">
              <span>{new Date(n.createdAt).toLocaleString()}</span>
              {!n.isRead && (
                <button className="link-btn" onClick={() => onMarkRead(n.id)}>
                  Mark read
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="tray-footer">
        <Link to="/notifications" onClick={onClose}>Open notifications center</Link>
      </div>
    </div>
  );
}
