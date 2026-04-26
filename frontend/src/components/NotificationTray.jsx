import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../features/auth/AuthContext';
import { getNotificationTarget } from '../utils/notificationTarget';

const TRAY_POLL_MS = 5000;

export default function NotificationTray({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    let alive = true;

    const loadItems = async () => {
      try {
        const res = await notificationApi.listMine();
        if (!alive) return;
        setItems((res.data || []).slice(0, 6));
      } catch {
        if (!alive) return;
        setItems([]);
      }
    };

    loadItems();

    const refreshItems = () => {
      loadItems();
    };

    const timer = setInterval(loadItems, TRAY_POLL_MS);
    window.addEventListener('focus', refreshItems);

    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('focus', refreshItems);
    };
  }, [open]);

  const onMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
      window.dispatchEvent(new Event('notifications:changed'));
    } catch {
      // Keep UI stable even if the backend call fails.
    }
  };

  const openNotification = async (notification, event) => {
    if (event) {
      event.stopPropagation();
    }

    const target = getNotificationTarget(notification, user?.role);

    if (!notification.isRead) {
      try {
        await notificationApi.markRead(notification.id);
        setItems((prev) => prev.map((x) => (x.id === notification.id ? { ...x, isRead: true } : x)));
        window.dispatchEvent(new Event('notifications:changed'));
      } catch {
        // Ignore mark read failures and still allow navigation.
      }
    }

    onClose();
    navigate(target);
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
          <article
            key={n.id}
            className={`tray-item ${n.isRead ? '' : 'is-unread'} clickable`}
            onClick={() => openNotification(n)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openNotification(n, e);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <h4>{n.title}</h4>
            <p>{n.message}</p>
            <div className="tray-item-actions">
              <span>{new Date(n.createdAt).toLocaleString()}</span>
              <div className="inline-actions">
                <button className="link-btn" onClick={(e) => openNotification(n, e)}>
                  Open
                </button>
                {!n.isRead && (
                  <button className="link-btn" onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(n.id);
                  }}>
                    Mark read
                  </button>
                )}
              </div>
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
