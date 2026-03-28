import { useState } from 'react';

function Panel({ title, text }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export default function UserDashboard() {
  const [tab, setTab] = useState('overview');

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
          <Panel title="Bookings" text="Manage your reservations." />
          <Panel title="Tickets" text="Report issues and follow progress." />
          <Panel title="Updates" text="See campus announcements." />
        </div>
      )}
      {tab !== 'overview' && <article className="card">Feature module for {tab} is ready for backend integration.</article>}
    </div>
  );
}
