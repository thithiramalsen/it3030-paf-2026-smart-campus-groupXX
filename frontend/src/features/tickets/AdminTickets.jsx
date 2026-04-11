import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_COLORS = {
  OPEN: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#22c55e',
  CLOSED: '#6b7280',
  REJECTED: '#ef4444',
};

const STATUSES = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadTickets = async (status) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/tickets${status !== 'ALL' ? `?status=${status}` : ''}`
      );
      setTickets(res.data);
    } catch {
      setError('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets(filter);
  }, [filter]);

  // ✅ Assign technician
  const handleAssign = async (id) => {
    const tech = prompt('Enter technician name:');
    if (!tech) return;

    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}/assign`, {
        technicianAssigned: tech,
      });
      loadTickets(filter);
    } catch {
      alert('Failed to assign technician');
    }
  };

  // ✅ Update status
  const handleStatusUpdate = async (id, status) => {
    let notes = '';

    if (status === 'RESOLVED') {
      notes = prompt('Enter resolution notes:');
      if (!notes) return alert('Resolution notes required');
    }

    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}/status`, {
        status,
        resolutionNotes: notes,
      });
      loadTickets(filter);
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>

      {/* Back */}
      <button onClick={() => navigate('/admin')} style={{
        marginBottom: 16, padding: '6px 12px',
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 8, cursor: 'pointer', fontSize: 13
      }}>
        ← Back to Admin Dashboard
      </button>

      <h2>🎫 All Tickets</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid #e5e7eb',
            background: filter === s ? '#2563eb' : '#fff',
            color: filter === s ? '#fff' : '#374151',
            cursor: 'pointer',
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && tickets.length === 0 && (
        <p style={{ color: '#6b7280' }}>No tickets found.</p>
      )}

      {/* Ticket Cards */}
      {tickets.map((t) => (
        <div key={t.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{t.title}</strong>
            <span style={{
              background: STATUS_COLORS[t.status],
              color: '#fff',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 13,
            }}>
              {t.status}
            </span>
          </div>

          {/* Details */}
          <p style={{ marginTop: 6 }}>{t.description}</p>

          <p style={{ margin: '4px 0', color: '#374151' }}>
            📌 {t.category} | ⚡ {t.priority} | 📍 {t.location}
          </p>

          {/* Technician */}
          {t.technicianAssigned ? (
            <p>👨‍🔧 Assigned: {t.technicianAssigned}</p>
          ) : (
            <button onClick={() => handleAssign(t.id)} style={{
              marginTop: 6,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}>
              Assign Technician
            </button>
          )}

          {/* Resolution */}
          {t.resolutionNotes && (
            <p style={{ color: '#16a34a', marginTop: 6 }}>
              ✅ {t.resolutionNotes}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {t.status === 'OPEN' && (
              <button onClick={() => handleStatusUpdate(t.id, 'IN_PROGRESS')}
                style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 6 }}>
                Start
              </button>
            )}

            {t.status === 'IN_PROGRESS' && (
              <button onClick={() => handleStatusUpdate(t.id, 'RESOLVED')}
                style={{ background: '#22c55e', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 6 }}>
                Resolve
              </button>
            )}

            {t.status === 'RESOLVED' && (
              <button onClick={() => handleStatusUpdate(t.id, 'CLOSED')}
                style={{ background: '#6b7280', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 6 }}>
                Close
              </button>
            )}

            <button onClick={() => handleStatusUpdate(t.id, 'REJECTED')}
              style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 6 }}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}