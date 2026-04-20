import { useState } from 'react';
import { ClipboardCheck, LayoutDashboard, ShieldAlert, Wrench } from 'lucide-react';
import AssignedTickets from '../features/tickets/AssignedTickets';

export default function TechnicianDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Field Operations</p>
        <h1 className="page-hero-title">Technician Dashboard</h1>
        <p className="muted">Stay on top of incident response, maintenance tasks, and service reports.</p>
      </section>

      <div className="inline-actions tabs">
        <button className={tab === 'overview' ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'tickets' ? 'tab active' : 'tab'} onClick={() => setTab('tickets')}>Tickets</button>
        <button className={tab === 'maintenance' ? 'tab active' : 'tab'} onClick={() => setTab('maintenance')}>Maintenance</button>
        <button className={tab === 'reports' ? 'tab active' : 'tab'} onClick={() => setTab('reports')}>Reports</button>
      </div>

      {tab === 'overview' && (
        <div className="card-grid two">
          <article className="card interactive">
            <div className="feature-icon brand">
              <LayoutDashboard size={18} />
            </div>
            <h3>Shift overview</h3>
            <p className="feature-meta">Review active requests, pending follow-ups, and your current assignments.</p>
          </article>
          <article className="card interactive">
            <div className="feature-icon sky">
              <Wrench size={18} />
            </div>
            <h3>Maintenance queue</h3>
            <p className="feature-meta">Keep equipment service windows and preventive checks on schedule.</p>
          </article>
        </div>
      )}

      {tab === 'tickets' && (
        <AssignedTickets />
      )}

      {tab === 'maintenance' && (
        <article className="card">
          <div className="feature-icon rose">
            <ShieldAlert size={18} />
          </div>
          <h3>Maintenance controls</h3>
          <p className="feature-meta">Track critical assets that need urgent repairs or inspections.</p>
        </article>
      )}

      {tab === 'reports' && (
        <article className="card">
          <h3>Reports</h3>
          <p className="feature-meta">Weekly diagnostics and task completion metrics will appear here.</p>
        </article>
      )}
    </div>
  );
}
