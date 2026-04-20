import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, Building2, CalendarClock, CalendarPlus, Ticket } from 'lucide-react';

function Panel({ title, text, onClick, icon: Icon, tone = 'brand' }) {
  return (
    <article className="card interactive" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={`feature-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <h3>{title}</h3>
      <p className="feature-meta">{text}</p>
    </article>
  );
}

export default function UserDashboard() {
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">User Workspace</p>
        <h1 className="page-hero-title">User Dashboard</h1>
        <p className="muted">Quick actions for resources, bookings, and service updates.</p>
      </section>

      <div className="inline-actions tabs">
        <button className={tab === 'overview' ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'resources' ? 'tab active' : 'tab'} onClick={() => setTab('resources')}>Resources</button>
        <button className={tab === 'bookings' ? 'tab active' : 'tab'} onClick={() => setTab('bookings')}>Bookings</button>
        <button className={tab === 'tickets' ? 'tab active' : 'tab'} onClick={() => setTab('tickets')}>Tickets</button>
      </div>

      {tab === 'overview' && (
        <div className="card-grid two">
          <Panel
            title="Resources"
            text="Browse and request resources."
            icon={Building2}
            tone="brand"
            onClick={() => setTab('resources')}
          />
          <Panel
            title="Bookings"
            text="Manage your reservations."
            icon={CalendarClock}
            tone="sky"
            onClick={() => setTab('bookings')}
          />
          <Panel title="Tickets" text="Report issues and follow progress." icon={Ticket} tone="amber" />
          <Panel title="Updates" text="See campus announcements." icon={BellRing} tone="rose" />
        </div>
      )}

      {tab === 'bookings' && (
        <article className="card">
          <h3>Bookings</h3>
          <p className="muted">Create requests and monitor approvals from one place.</p>
          <div className="inline-actions">
            <button className="btn-primary" onClick={() => navigate('/bookings/new')}>
              <CalendarPlus size={16} />
              New Booking
            </button>
            <button className="btn-outline" onClick={() => navigate('/bookings/my')}>
              <CalendarClock size={16} />
              View My Bookings
            </button>
          </div>
        </article>
      )}

      {tab === 'resources' && (
        <article className="card">
          <h3>Resources</h3>
          <p className="muted">Explore availability and jump straight into booking.</p>
          <div className="inline-actions">
            <button className="btn-primary" onClick={() => navigate('/resources')}>
              <Building2 size={16} />
              Browse Resources
            </button>
            <button className="btn-outline" onClick={() => navigate('/bookings/new')}>
              <CalendarPlus size={16} />
              Book a Resource
            </button>
          </div>
          <p className="muted">Choose a resource to view details and start booking.</p>
        </article>
      )}

      {tab !== 'overview' && tab !== 'bookings' && tab !== 'resources' && (
        <article className="card">Feature module for {tab} is ready for backend integration.</article>
      )}
    </div>
  );
}