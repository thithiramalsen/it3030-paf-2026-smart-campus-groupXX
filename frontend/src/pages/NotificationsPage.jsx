import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../features/auth/AuthContext';
import { getNotificationTarget } from '../utils/notificationTarget';

const PAGE_POLL_MS = 5000;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadItems = async () => {
      try {
        const res = await notificationApi.listMine();
        if (!alive) return;
        setItems(res.data || []);
        setError('');
      } catch {
        if (!alive) return;
        setError('Notification endpoint is unavailable right now.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadItems();

    const refreshItems = () => {
      loadItems();
    };

    const timer = setInterval(loadItems, PAGE_POLL_MS);
    window.addEventListener('focus', refreshItems);

    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('focus', refreshItems);
    };
  }, []);

  const unread = useMemo(() => items.filter((x) => !x.isRead).length, [items]);

  const markOne = async (id) => {
    try {
      await notificationApi.markRead(id);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
      window.dispatchEvent(new Event('notifications:changed'));
    } catch {
      setError('Could not mark notification as read.');
    }
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      window.dispatchEvent(new Event('notifications:changed'));
    } catch {
      setError('Could not mark all notifications as read.');
    }
  };

  const remove = async (id) => {
    try {
      await notificationApi.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      window.dispatchEvent(new Event('notifications:changed'));
    } catch {
      setError('Could not delete notification.');
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
        // Ignore mark read failures and still navigate.
      }
    }

    navigate(target);
  };

  if (loading) return <div className="page-block">Loading notifications...</div>;

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Inbox</p>
        <h1 className="page-hero-title">Notifications</h1>
        <p className="muted">Stay on top of approvals, updates, and action-required alerts.</p>
      </section>

      <div className="inline-actions spread">
        <div className="inline-actions">
          <div className="feature-icon sky">
            <Bell size={18} />
          </div>
          <h3>Recent activity</h3>
        </div>
        {unread > 0 && (
          <button className="btn-outline" onClick={markAll}>
            <CheckCheck size={16} />
            Mark all as read ({unread})
          </button>
        )}
      </div>
      {error && <p className="muted">{error}</p>}
      <div className="stack-list">
        {items.length === 0 && <p className="muted">No notifications available.</p>}
        {items.map((n) => (
          <article
            key={n.id}
            className={`card ${n.isRead ? '' : 'accent-card'} interactive notification-card-link`}
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
            <h3>{n.title}</h3>
            <p>{n.message}</p>
            <p className="muted">{new Date(n.createdAt).toLocaleString()}</p>
            <div className="inline-actions">
              <button className="btn-outline" onClick={(e) => openNotification(n, e)}>Open</button>
              {!n.isRead && (
                <button className="btn-outline" onClick={(e) => {
                  e.stopPropagation();
                  markOne(n.id);
                }}>Mark read</button>
              )}
              <button className="btn-danger" onClick={(e) => {
                e.stopPropagation();
                remove(n.id);
              }}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
