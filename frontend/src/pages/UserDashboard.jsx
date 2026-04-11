import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Panel({ title, text, onClick }) {
  return (
    <article className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export default function UserDashboard() {
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  return (
    <div className="page-block">
      <h1>User Dashboard</h1>
      <div className="inline-actions tabs">
        <button className={tab === 'overview' ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'resources' ? 'tab active' : 'tab'} onClick={() => setTab('resources')}>Resources</button>
        <button className={tab === 'bookings' ? 'tab active' : 'tab'} onClick={() => setTab('bookings')}>Bookings</button>
        <button className={tab === 'tickets' ? 'tab active' : 'tab'} onClick={() => setTab('tickets')}>Tickets</button>
      </div>

      {tab === 'overview' && (
        <div className="card-grid two">
          <Panel title="Resources" text="Browse and request resources." />
          <Panel title="Bookings" text="Manage your reservations." onClick={() => setTab('bookings')} />
          <Panel title="Tickets" text="Report issues and follow progress." />
          <Panel title="Updates" text="See campus announcements." />
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Booking Tools</h3>
          <div className="card-grid two">
            <article className="card" onClick={() => navigate('/bookings/new')}
              style={{ cursor: 'pointer' }}>
              <h3>📝 New Booking</h3>
              <p>Request a room, lab, or equipment booking with smart slot suggestions.</p>
            </article>
            <article className="card" onClick={() => navigate('/bookings/my')}
              style={{ cursor: 'pointer' }}>
              <h3>📋 My Bookings</h3>
              <p>View and manage all your booking requests and their statuses.</p>
            </article>
            <article className="card" onClick={() => navigate('/bookings/calendar')}
              style={{ cursor: 'pointer' }}>
              <h3>📅 Booking Calendar</h3>
              <p>See all your bookings on a monthly calendar view.</p>
            </article>
            <article className="card" onClick={() => navigate('/bookings/heatmap')}
              style={{ cursor: 'pointer' }}>
              <h3>📊 Availability Heatmap</h3>
              <p>Check which hours are busiest for any resource before booking.</p>
            </article>
          </div>
        </div>
      )}

      {tab !== 'overview' && tab !== 'bookings' && (
        <article className="card">Feature module for {tab} is ready for backend integration.</article>
      )}
    </div>
  );
}