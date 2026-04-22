import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, ClipboardList, LayoutDashboard, Wrench } from 'lucide-react';
import ResourceManagement from '../pages/ResourceManagement';

export default function ManagerDashboard() {
  const [tab, setTab] = useState('overview');
  const location = useLocation();

  // When navigating back from Add/Edit pages, auto-select the resources tab
  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state]);

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Management Console</p>
        <h1 className="page-hero-title">Manager Dashboard</h1>
        <p className="muted">Coordinate teams, resources, and service quality from a single view.</p>
      </section>

      <div className="inline-actions tabs">
        <button className={tab === 'overview'   ? 'tab active' : 'tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'tickets'    ? 'tab active' : 'tab'} onClick={() => setTab('tickets')}>Tickets</button>
        <button className={tab === 'resources'  ? 'tab active' : 'tab'} onClick={() => setTab('resources')}>Resources</button>
        <button className={tab === 'analytics'  ? 'tab active' : 'tab'} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {tab === 'overview' && (
        <div className="card-grid two">
          <article className="card interactive">
            <div className="feature-icon brand">
              <LayoutDashboard size={18} />
            </div>
            <h3>Operational overview</h3>
            <p className="feature-meta">Monitor team load, pending tasks, and service trends in one dashboard.</p>
          </article>
          <article className="card interactive">
            <div className="feature-icon sky">
              <Wrench size={18} />
            </div>
            <h3>Maintenance readiness</h3>
            <p className="feature-meta">Track escalations and ensure critical resources are always available.</p>
          </article>
        </div>
      )}

      {tab === 'tickets' && (
        <article className="card">
          <div className="feature-icon amber">
            <ClipboardList size={18} />
          </div>
          <h3>Ticket operations</h3>
          <p className="feature-meta">Review incoming issues, prioritize response windows, and coordinate technicians.</p>
        </article>
      )}

      {tab === 'resources' && <ResourceManagement />}

      {tab === 'analytics' && (
        <article className="card">
          <div className="feature-icon rose">
            <BarChart3 size={18} />
          </div>
          <h3>Analytics module</h3>
          <p className="feature-meta">Usage heatmaps and trend insights are ready for backend integration.</p>
        </article>
      )}
    </div>
  );
}