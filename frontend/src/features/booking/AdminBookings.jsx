import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { useAppFeedback } from '../../components/ui/AppFeedbackProvider';

const STATUS_CONFIG = {
  PENDING:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending' },
  APPROVED:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Approved' },
  REJECTED:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Rejected' },
  CANCELLED: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: 'Cancelled' },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { prompt, toast } = useAppFeedback();

  const loadBookings = async (status) => {
    setLoading(true);
    try {
      const res = await bookingApi.getAllBookings(status === 'ALL' ? null : status);
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(filter); }, [filter]);

  const handleApprove = async (id) => {
    const note = await prompt({
      title: 'Approve booking',
      message: 'Add an optional approval note.',
      placeholder: 'Optional note',
      confirmText: 'Approve',
      cancelText: 'Cancel',
    });
    try {
      await bookingApi.approveBooking(id, note);
      loadBookings(filter);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to approve.', { type: 'error' });
    }
  };

  const handleReject = async (id) => {
    const note = await prompt({
      title: 'Reject booking',
      message: 'Please provide a rejection reason.',
      placeholder: 'Required reason',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      required: true,
      tone: 'danger',
    });
    if (!note) return;
    try {
      await bookingApi.rejectBooking(id, note);
      loadBookings(filter);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to reject.', { type: 'error' });
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 24px 48px' }}>

      {/* Header */}
      <button onClick={() => navigate('/admin')} style={{
        marginBottom: 16, padding: '6px 12px', background: 'transparent',
        border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#6b7280'
      }}>← Back to Admin Dashboard</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#111827' }}>Booking Management</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>
            {pendingCount > 0 ? `${pendingCount} booking${pendingCount > 1 ? 's' : ''} awaiting review` : 'All bookings up to date'}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            border: '1px solid #e5e7eb', cursor: 'pointer',
            background: filter === s ? '#2563eb' : '#fff',
            color: filter === s ? '#fff' : '#6b7280',
          }}>
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}
            {s === 'PENDING' && pendingCount > 0 && (
              <span style={{
                marginLeft: 6, background: '#dc2626', color: '#fff',
                borderRadius: 10, padding: '1px 6px', fontSize: 10
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
          <p style={{ margin: 0, fontSize: 15 }}>No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings found.</p>
        </div>
      )}

      {/* Booking cards */}
      {bookings.map((b) => {
        const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.CANCELLED;
        return (
          <div key={b.id} style={{
            border: '1px solid #e5e7eb', borderRadius: 12, padding: 16,
            marginBottom: 12, background: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>{b.resourceName}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{b.resourceLocation}</p>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`
              }}>{cfg.label}</span>
            </div>

            {/* User info */}
            <div style={{ padding: '8px 10px', borderRadius: 8, background: '#f8fafc', marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
                👤 <span style={{ fontWeight: 500 }}>{b.userName}</span>
                <span style={{ color: '#9ca3af', marginLeft: 6 }}>{b.userEmail}</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#374151' }}>📅 {b.bookingDate}</span>
              <span style={{ fontSize: 13, color: '#374151' }}>🕐 {b.startTime} – {b.endTime}</span>
              {b.expectedAttendees && <span style={{ fontSize: 13, color: '#374151' }}>👥 {b.expectedAttendees} people</span>}
            </div>

            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6b7280' }}>
              <span style={{ fontWeight: 500 }}>Purpose:</span> {b.purpose}
            </p>

            {b.adminNote && (
              <div style={{ padding: '6px 10px', borderRadius: 6, background: '#f8fafc', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  <span style={{ fontWeight: 600 }}>Admin note:</span> {b.adminNote}
                </p>
              </div>
            )}

            {b.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => handleApprove(b.id)} style={{
                  padding: '7px 18px', background: '#16a34a', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600
                }}>✓ Approve</button>
                <button onClick={() => handleReject(b.id)} style={{
                  padding: '7px 18px', background: '#fff', color: '#dc2626',
                  border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: 13
                }}>✕ Reject</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}