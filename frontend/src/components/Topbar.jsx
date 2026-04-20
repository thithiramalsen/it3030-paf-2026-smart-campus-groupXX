import { useEffect, useState } from 'react';
import { Bell, CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { notificationApi } from '../api/notificationApi';
import NotificationTray from './NotificationTray';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [trayOpen, setTrayOpen] = useState(false);
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    let alive = true;

    const loadUnread = async () => {
      try {
        const res = await notificationApi.unreadCount();
        if (!alive) return;
        const count = typeof res.data === 'number' ? res.data : 0;
        setUnread(count);
      } catch {
        if (!alive) return;
        setUnread(0);
      }
    };

    loadUnread();
    const timer = setInterval(loadUnread, 30000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-meta">
        <h2>{user?.fullName || user?.name || 'Smart Campus'}</h2>
        <p className="topbar-date">
          <CalendarDays size={14} />
          {dateLabel}
        </p>
      </div>
      <div className="topbar-actions">
        <button className="notif-btn" onClick={() => setTrayOpen((v) => !v)}>
          <Bell size={16} />
          Notifications
          {unread > 0 && <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>}
        </button>
        <button className="btn-outline" onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
      <NotificationTray open={trayOpen} onClose={() => setTrayOpen(false)} />
    </header>
  );
}
