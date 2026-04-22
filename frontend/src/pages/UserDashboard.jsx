import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BellRing, Building2, CalendarClock, CalendarDays, CalendarPlus, Ticket } from 'lucide-react';

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
          <Panel title="Tickets" text="Report issues and follow progress." icon={Ticket} tone="amber" onClick={() => setTab('tickets')} />
          <Panel title="Updates" text="See campus announcements." icon={BellRing} tone="rose" onClick={() => navigate('/notifications')} />
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <h3 style={{ marginBottom: 12 }}>Booking Tools</h3>
          <div className="card-grid two">
            <article className="card interactive" onClick={() => navigate('/bookings/new')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon brand"><CalendarPlus size={18} /></div>
              <h3>New Booking</h3>
              <p className="feature-meta">Request a room, lab, or equipment booking with smart slot suggestions.</p>
            </article>
            <article className="card interactive" onClick={() => navigate('/bookings/my')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon sky"><CalendarClock size={18} /></div>
              <h3>My Bookings</h3>
              <p className="feature-meta">View and manage all your booking requests and their statuses.</p>
            </article>
            <article className="card interactive" onClick={() => navigate('/bookings/calendar')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon amber"><CalendarDays size={18} /></div>
              <h3>Booking Calendar</h3>
              <p className="feature-meta">See all your bookings on a monthly calendar view.</p>
            </article>
            <article className="card interactive" onClick={() => navigate('/bookings/heatmap')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon rose"><BarChart3 size={18} /></div>
              <h3>Availability Heatmap</h3>
              <p className="feature-meta">Check which hours are busiest for any resource before booking.</p>
            </article>
          </div>
        </div>
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

      {tab === 'tickets' && (
        <article className="card">
          <h3>Ticket Tools</h3>
          <p className="muted">Create a new issue or review your existing tickets.</p>
          <div className="inline-actions">
            <button className="btn-primary" onClick={() => navigate('/tickets/new')}>
              <Ticket size={16} />
              New Ticket
            </button>
            <button className="btn-outline" onClick={() => navigate('/tickets/my')}>
              <Ticket size={16} />
              My Tickets
            </button>
          </div>
        </article>
      )}

      {tab !== 'overview' && tab !== 'bookings' && tab !== 'resources' && tab !== 'tickets' && (
        <article className="card">Feature module for {tab} is ready for backend integration.</article>
      )}
    </div>
  );
}