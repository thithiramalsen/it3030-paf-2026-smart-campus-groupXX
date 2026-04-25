import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock3, HardDrive, LayoutDashboard } from 'lucide-react';
import { getAllTickets } from '../api/ticketsApi';

export default function ManagerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState('');
  const navigate = useNavigate();

  const loadTickets = async () => {
    setTicketsLoading(true);
    setTicketsError('');
    try {
      const res = await getAllTickets();
      setTickets(res.data || []);
    } catch {
      setTicketsError('Failed to load tickets.');
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const activeTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS'),
    [tickets]
  );

  const unassignedTickets = useMemo(
    () => tickets.filter((ticket) => !ticket.technicianAssigned),
    [tickets]
  );

  const resolvedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'),
    [tickets]
  );

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Management Console</p>
        <h1 className="page-hero-title">Manager Dashboard</h1>
        <p className="muted">Coordinate ticket priorities and resource readiness from one consistent operations view.</p>
      </section>

      <div className="card-grid four">
        <article className="card stat">
          <div className="feature-icon brand"><LayoutDashboard size={18} /></div>
          <h3>Total tickets</h3>
          <p>{tickets.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon sky"><ClipboardList size={18} /></div>
          <h3>Active queue</h3>
          <p>{activeTickets.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon amber"><Clock3 size={18} /></div>
          <h3>Unassigned</h3>
          <p>{unassignedTickets.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon rose"><HardDrive size={18} /></div>
          <h3>Resolved/closed</h3>
          <p>{resolvedTickets.length}</p>
          <div className="stat-line" />
        </article>
      </div>

      <article className="card">
        <h3>Quick management</h3>
        <p className="feature-meta">Use the same concise action panel pattern across role dashboards.</p>
        <div className="inline-actions">
          <button className="btn-primary" onClick={() => navigate('/manager/resources')}>Manage Resources</button>
          <button className="btn-outline" onClick={loadTickets}>Refresh Ticket Queue</button>
          <button className="btn-outline" onClick={() => navigate('/notifications')}>Open Notifications</button>
        </div>
      </article>

      <article className="card">
        <div className="inline-actions spread">
          <h3>Ticket oversight</h3>
          <span className="muted">{activeTickets.length} active</span>
        </div>
        <p className="feature-meta">Review current queue health and escalation pressure without dashboard duplication.</p>

        {ticketsLoading && <p className="muted">Loading tickets...</p>}
        {ticketsError && <p className="muted">{ticketsError}</p>}

        {!ticketsLoading && !ticketsError && activeTickets.length === 0 && (
          <p className="muted">No active tickets available.</p>
        )}

        {!ticketsLoading && !ticketsError && activeTickets.length > 0 && (
          <div className="stack-list">
            {activeTickets.slice(0, 8).map((ticket) => (
              <div key={ticket.id} className="card">
                <div className="inline-actions spread">
                  <h4>{ticket.title}</h4>
                  <strong>{ticket.status}</strong>
                </div>
                <p className="muted">{ticket.description}</p>
                <div className="inline-actions">
                  <span><strong>Priority:</strong> {ticket.priority}</span>
                  <span><strong>Category:</strong> {ticket.category}</span>
                  <span>
                    <strong>Resource:</strong> {ticket.resourceName || '-'}
                    {ticket.resourceLocation ? ` (${ticket.resourceLocation})` : ''}
                  </span>
                </div>
                <p className="muted" style={{ marginTop: 8 }}>
                  Assigned: {ticket.technicianAssigned || 'Not assigned'}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}