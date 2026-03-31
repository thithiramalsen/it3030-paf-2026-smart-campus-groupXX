import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    adminApi
      .getUsers()
      .then((res) => alive && setUsers(res.data || []))
      .catch(() => alive && setError('Admin user endpoint is unavailable right now.'))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.accountStatus === 'ACTIVE').length;
    const pending = users.filter((u) => u.accountStatus === 'PENDING_APPROVAL').length;
    const suspended = users.filter((u) => u.accountStatus === 'SUSPENDED').length;
    return { total: users.length, active, pending, suspended };
  }, [users]);

  if (loading) return <div className="page-block">Loading admin dashboard...</div>;

  return (
    <div className="page-block">
      <h1>Admin Dashboard</h1>
      {error && <p className="muted">{error}</p>}
      <div className="card-grid four">
        <article className="card stat"><h3>Total users</h3><p>{stats.total}</p></article>
        <article className="card stat"><h3>Active</h3><p>{stats.active}</p></article>
        <article className="card stat"><h3>Pending</h3><p>{stats.pending}</p></article>
        <article className="card stat"><h3>Suspended</h3><p>{stats.suspended}</p></article>
      </div>
      <article className="card">
        <h3>Quick management</h3>
        <p>Review account approvals and role assignments.</p>
        <Link className="text-link" to="/admin/users">Go to user management</Link>
      </article>
    </div>
  );
}
