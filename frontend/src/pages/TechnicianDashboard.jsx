import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Clock3, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { getAssignedTickets } from '../api/ticketsApi';

export default function TechnicianDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadAssignedTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAssignedTickets();
      setTickets(res.data || []);
    } catch {
      setError('Failed to load assigned tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedTickets();
  }, []);

  const activeTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED'),
    [tickets]
  );

  const inProgressCount = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    [tickets]
  );

  const resolvedCount = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length,
    [tickets]
  );

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Field Operations</p>
        <h1 className="page-hero-title">Technician Dashboard</h1>
        <p className="muted">Track your work queue, close incidents faster, and keep maintenance response predictable.</p>
      </section>

      <div className="card-grid four">
        <article className="card stat">
          <div className="feature-icon brand"><LayoutDashboard size={18} /></div>
          <h3>Total assigned</h3>
          <p>{tickets.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon sky"><ClipboardCheck size={18} /></div>
          <h3>Active queue</h3>
          <p>{activeTickets.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon amber"><Clock3 size={18} /></div>
          <h3>In progress</h3>
          <p>{inProgressCount}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon rose"><ShieldAlert size={18} /></div>
          <h3>Completed</h3>
          <p>{resolvedCount}</p>
          <div className="stat-line" />
        </article>
      </div>

      <article className="card">
        <h3>Quick actions</h3>
        <p className="feature-meta">Use the same operational controls pattern used in other dashboards.</p>
        <div className="inline-actions">
          <button className="btn-primary" onClick={loadAssignedTickets}>Refresh Queue</button>
          <button className="btn-outline" onClick={() => navigate('/resources')}>Browse Resources</button>
          <button className="btn-outline" onClick={() => navigate('/notifications')}>Open Notifications</button>
        </div>
      </article>

      <article className="card">
        <div className="inline-actions spread">
          <h3>Assigned ticket queue</h3>
          <span className="muted">{activeTickets.length} active</span>
        </div>

        {loading && <p className="muted">Loading assigned tickets...</p>}
        {error && <p className="muted">{error}</p>}

        {!loading && !error && activeTickets.length === 0 && (
          <p className="muted">No active tickets assigned right now.</p>
        )}

        {!loading && !error && activeTickets.length > 0 && (
          <div className="stack-list">
            {activeTickets.slice(0, 8).map((ticket) => (
              <article
                key={ticket.id}
                className="card interactive"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="inline-actions spread">
                  <h4>{ticket.title}</h4>
                  <strong>{ticket.status}</strong>
                </div>
                <p className="muted">{ticket.description}</p>
                <div className="inline-actions">
                  <span><strong>Priority:</strong> {ticket.priority}</span>
                  <span>
                    <strong>Resource:</strong> {ticket.resourceName || '-'}
                    {ticket.resourceLocation ? ` (${ticket.resourceLocation})` : ''}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
