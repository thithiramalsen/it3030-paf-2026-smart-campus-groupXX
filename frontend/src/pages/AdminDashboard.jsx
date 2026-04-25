import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, ShieldCheck, UserCheck, UserX, Users } from 'lucide-react';
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
      <section className="page-hero">
        <p className="kicker">Administration</p>
        <h1 className="page-hero-title">Admin Dashboard</h1>
        <p className="muted">Govern access, approvals, and booking oversight with confidence.</p>
      </section>

      {error && <p className="muted">{error}</p>}

      <div className="card-grid four">
        <article className="card stat">
          <div className="feature-icon sky"><Users size={18} /></div>
          <h3>Total users</h3>
          <p>{stats.total}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon brand"><UserCheck size={18} /></div>
          <h3>Active</h3>
          <p>{stats.active}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon amber"><Clock3 size={18} /></div>
          <h3>Pending</h3>
          <p>{stats.pending}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon rose"><UserX size={18} /></div>
          <h3>Suspended</h3>
          <p>{stats.suspended}</p>
          <div className="stat-line" />
        </article>
      </div>

      <article className="card">
        <div className="feature-icon brand"><ShieldCheck size={18} /></div>
        <h3>Quick management</h3>
        <p>Review account approvals and role assignments.</p>
        <Link className="text-link" to="/admin/users">Go to user management</Link>
      </article>

      <article className="card">
        <h3>Booking management</h3>
        <p>Review, approve, or reject booking requests from users.</p>
        <Link className="text-link" to="/admin/bookings">Go to booking management</Link>
      </article>

      <article className="card">
        <h3>Platform analytics</h3>
        <p>View cross-module analytics for users, bookings, tickets, and resources.</p>
        <Link className="text-link" to="/admin/analytics">Open analytics center</Link>
      </article>
      
      <article className="card">
        <h3>Resource availability heatmap</h3>
        <p>See which hours are busiest for any resource over the next 14 days.</p>
        <Link className="text-link" to="/bookings/heatmap">View heatmap</Link>
      </article>

      {/* 🔥 YOUR ADDITION — TICKET MANAGEMENT */}
      <article className="card">
        <h3>Ticket Management</h3>
        <p>View, assign, and manage incident tickets.</p>
        <Link className="text-link" to="/admin/tickets">
          Go to ticket management
        </Link>
      </article>

      {/* 🔥 YOUR ADDITION — REPLY TICKETS */}
      <article className="card">
        <h3>Reply Tickets</h3>
        <p>Respond to user issues and manage ticket conversations.</p>
        <Link className="text-link" to="/admin/tickets/reply">
          Go to reply tickets
        </Link>
      </article>

    </div>
  );
}