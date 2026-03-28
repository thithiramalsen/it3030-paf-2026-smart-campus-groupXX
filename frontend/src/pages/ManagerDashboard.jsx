import { useState } from 'react';

export default function ManagerDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="page-block">
      <h1>Manager Dashboard</h1>
      <div className="inline-actions tabs">
        <button className={tab === 'overview' ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'tickets' ? 'tab active' : 'tab'} onClick={() => setTab('tickets')}>Tickets</button>
        <button className={tab === 'resources' ? 'tab active' : 'tab'} onClick={() => setTab('resources')}>Resources</button>
        <button className={tab === 'analytics' ? 'tab active' : 'tab'} onClick={() => setTab('analytics')}>Analytics</button>
      </div>
      <article className="card">Manager module selected: {tab}.</article>
    </div>
  );
}
