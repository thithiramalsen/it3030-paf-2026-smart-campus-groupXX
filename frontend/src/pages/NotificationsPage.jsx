import { useEffect, useMemo, useState } from 'react';
import { notificationApi } from '../api/notificationApi';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    notificationApi
      .listMine()
      .then((res) => alive && setItems(res.data || []))
      .catch(() => alive && setError('Notification endpoint is unavailable right now.'))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const unread = useMemo(() => items.filter((x) => !x.isRead).length, [items]);

  const markOne = async (id) => {
    try {
      await notificationApi.markRead(id);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
    } catch {
      setError('Could not mark notification as read.');
    }
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    } catch {
      setError('Could not mark all notifications as read.');
    }
  };

  const remove = async (id) => {
    try {
      await notificationApi.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError('Could not delete notification.');
    }
  };

  if (loading) return <div className="page-block">Loading notifications...</div>;

  return (
    <div className="page-block">
      <div className="inline-actions spread">
        <h1>Notifications</h1>
        {unread > 0 && (
          <button className="btn-outline" onClick={markAll}>
            Mark all as read ({unread})
          </button>
        )}
      </div>
      {error && <p className="muted">{error}</p>}
      <div className="stack-list">
        {items.length === 0 && <p className="muted">No notifications available.</p>}
        {items.map((n) => (
          <article key={n.id} className={`card ${n.isRead ? '' : 'accent-card'}`}>
            <h3>{n.title}</h3>
            <p>{n.message}</p>
            <p className="muted">{new Date(n.createdAt).toLocaleString()}</p>
            <div className="inline-actions">
              {!n.isRead && (
                <button className="btn-outline" onClick={() => markOne(n.id)}>Mark read</button>
              )}
              <button className="btn-danger" onClick={() => remove(n.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
