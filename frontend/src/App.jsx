import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { NotificationItem } from './components/NotificationItem.jsx';

function useTokens() {
  const initial = useMemo(() => api.tokenStore.get(), []);
  const [accessToken, setAccessToken] = useState(initial.accessToken);
  const [refreshToken, setRefreshToken] = useState(initial.refreshToken);

  const save = (a, r) => {
    api.setTokens(a, r);
    setAccessToken(a);
    setRefreshToken(r);
  };
  const clear = () => {
    api.clearTokens();
    setAccessToken('');
    setRefreshToken('');
  };
  return { accessToken, refreshToken, save, clear };
}

export default function App() {
  const { accessToken, refreshToken, save, clear } = useTokens();
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const [manualAccess, setManualAccess] = useState('');
  const [manualRefresh, setManualRefresh] = useState('');

  const authenticated = Boolean(accessToken);

  const loadData = async (targetPage = page) => {
    if (!authenticated) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchNotifications(targetPage, 10);
      setPageData(data);
      const unreadCount = await api.unreadCount();
      setUnread(typeof unreadCount === 'number' ? unreadCount : unreadCount?.count ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(0);
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const handleSaveTokens = () => {
    save(manualAccess, manualRefresh);
    setManualAccess('');
    setManualRefresh('');
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markRead(id);
      loadData(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNotification(id);
      loadData(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const nextPage = () => {
    if (pageData && !pageData.last) {
      const newPage = page + 1;
      setPage(newPage);
      loadData(newPage);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      const newPage = page - 1;
      setPage(newPage);
      loadData(newPage);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Smart Campus Ops</p>
          <h1>Notifications Hub</h1>
          <p className="subtitle">Stay on top of bookings, tickets, and campus updates.</p>
          <div className="pill-row">
            <span className="pill">Unread: {unread}</span>
            <span className="pill">Page size: 10</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-row">
            <div>
              <p className="label">Access token</p>
              <input
                value={manualAccess}
                onChange={(e) => setManualAccess(e.target.value)}
                placeholder="paste access token"
              />
            </div>
            <div>
              <p className="label">Refresh token</p>
              <input
                value={manualRefresh}
                onChange={(e) => setManualRefresh(e.target.value)}
                placeholder="paste refresh token"
              />
            </div>
          </div>
          <div className="panel-actions">
            <button onClick={handleSaveTokens} disabled={!manualAccess}>Save tokens</button>
            <button className="ghost" onClick={clear}>Log out</button>
          </div>
          <div className="panel-note">
            <p>Or use Google Sign-in:</p>
            <a className="link" href={api.loginUrl(window.location.origin)}>
              Start Google OAuth
            </a>
          </div>
          {authenticated && (
            <p className="muted">Session active: token set.</p>
          )}
        </div>
      </header>

      <main className="content">
        <div className="grid">
          <section className="section">
            <div className="section-header">
              <h2>Inbox</h2>
              <div className="actions">
                <button className="ghost" onClick={() => loadData(page)} disabled={!authenticated || loading}>
                  Refresh
                </button>
              </div>
            </div>
            {!authenticated && <p className="muted">Add tokens or sign in to load notifications.</p>}
            {error && <p className="error">{error}</p>}
            {loading && <p className="muted">Loading...</p>}
            {authenticated && !loading && pageData && pageData.content?.length === 0 && (
              <p className="muted">No notifications yet.</p>
            )}
            {authenticated && pageData && pageData.content?.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} onDelete={handleDelete} />
            ))}
            {authenticated && pageData && (
              <div className="pager">
                <button onClick={prevPage} disabled={page === 0}>Previous</button>
                <span className="muted">Page {page + 1}</span>
                <button onClick={nextPage} disabled={pageData.last}>Next</button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
