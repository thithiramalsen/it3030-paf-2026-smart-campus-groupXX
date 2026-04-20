import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BellRing, CalendarClock, LayoutGrid, Ticket } from 'lucide-react';

function Card({ title, body, onClick, icon: Icon, tone = 'brand' }) {
  return (
    <article className="card interactive" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={`feature-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <h3>{title}</h3>
      <p className="feature-meta">{body}</p>
    </article>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Operations Snapshot</p>
        <h1 className="page-hero-title">Welcome back, {user?.name || user?.fullName || 'Operator'}.</h1>
        <p className="muted">Role: {user?.role} | Status: {user?.accountStatus || 'ACTIVE'}</p>
      </section>

      <div className="card-grid four">
        <Card
          title="Resources"
          body="Browse and request equipment, labs, and campus spaces in seconds."
          icon={LayoutGrid}
          tone="brand"
          onClick={() => navigate('/resources')}
        />
        <Card
          title="Bookings"
          body="Track your reservations and check smart slot suggestions."
          icon={CalendarClock}
          tone="sky"
          onClick={() => navigate('/bookings/my')}
        />
        <Card title="Tickets" body="Submit and monitor support requests." icon={Ticket} tone="amber" />
        <Card title="Announcements" body="Stay updated on notices and events." icon={BellRing} tone="rose" />
      </div>
    </div>
  );
}