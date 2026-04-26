import { useEffect, useState } from 'react';
import { Bell, CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { notificationApi } from '../api/notificationApi';
import NotificationTray from './NotificationTray';

const NOTIFICATION_POLL_MS = 5000;

export default function Topbar() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [trayOpen, setTrayOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
  const displayName = user?.fullName || user?.name || 'Smart Campus';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'SC';

  useEffect(() => {
    setAvatarBroken(false);
  }, [user?.profileImageUrl]);

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

    const refreshUnread = () => {
      loadUnread();
    };

    const timer = setInterval(loadUnread, NOTIFICATION_POLL_MS);
    window.addEventListener('focus', refreshUnread);
    window.addEventListener('notifications:changed', refreshUnread);

    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('focus', refreshUnread);
      window.removeEventListener('notifications:changed', refreshUnread);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-identity">
        <div className="topbar-avatar-wrap" aria-hidden="true">
          {user?.profileImageUrl && !avatarBroken ? (
            <img
              src={user.profileImageUrl}
              alt={displayName}
              className="topbar-avatar"
              onError={() => setAvatarBroken(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="topbar-avatar-fallback">{initials}</div>
          )}
        </div>

        <div className="topbar-meta">
          <h2>{displayName}</h2>
          <p className="topbar-date">
            <CalendarDays size={14} />
            {dateLabel}
          </p>
        </div>
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
