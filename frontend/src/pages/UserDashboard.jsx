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
          <Panel
            title="Bookings"
            text="Manage your reservations."
            onClick={() => setTab('bookings')}
          />
          <Panel title="Tickets" text="Report issues and follow progress." />
          <Panel title="Updates" text="See campus announcements." />
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => navigate('/bookings/new')}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              + New Booking
            </button>
            <button
              onClick={() => navigate('/bookings/my')}
              style={{
                padding: '10px 20px',
                background: '#fff',
                color: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              View My Bookings
            </button>
          </div>
        </div>
      )}

      {tab !== 'overview' && tab !== 'bookings' && (
        <article className="card">Feature module for {tab} is ready for backend integration.</article>
      )}
    </div>
  );
}