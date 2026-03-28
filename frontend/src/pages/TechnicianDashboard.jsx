import { useState } from 'react';

export default function TechnicianDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="page-block">
      <h1>Technician Dashboard</h1>
      <div className="inline-actions tabs">
        <button className={tab === 'overview' ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'tickets' ? 'tab active' : 'tab'} onClick={() => setTab('tickets')}>Tickets</button>
        <button className={tab === 'maintenance' ? 'tab active' : 'tab'} onClick={() => setTab('maintenance')}>Maintenance</button>
        <button className={tab === 'reports' ? 'tab active' : 'tab'} onClick={() => setTab('reports')}>Reports</button>
      </div>
      <article className="card">Technician module selected: {tab}.</article>
    </div>
  );
}
