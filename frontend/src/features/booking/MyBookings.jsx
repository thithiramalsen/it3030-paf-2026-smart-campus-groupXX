import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';

const STATUS_CONFIG = {
  PENDING:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending' },
  APPROVED:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Approved' },
  REJECTED:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Rejected' },
  CANCELLED: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: 'Cancelled' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation (optional):');
    try {
      await bookingApi.cancelBooking(id, reason);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div style={{ padding: 24, color: '#6b7280' }}>Loading your bookings...</div>;
  if (error) return <div style={{ padding: 24, color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 24px 48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#111827' }}>My Bookings</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/bookings/calendar')} style={{
            padding: '8px 14px', background: '#fff', color: '#374151',
            border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13
          }}>📅 Calendar</button>
          <button onClick={() => navigate('/bookings/new')} style={{
            padding: '8px 14px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>+ New Booking</button>
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
          }}>{s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}</button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
          <p style={{ margin: 0, fontSize: 15 }}>No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings found.</p>
          {filter === 'ALL' && (
            <button onClick={() => navigate('/bookings/new')} style={{
              marginTop: 16, padding: '8px 20px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14
            }}>Make your first booking</button>
          )}
        </div>
      )}

      {/* Booking cards */}
      {filtered.map((b) => {
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

            <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#374151' }}>📅 {b.bookingDate}</span>
              <span style={{ fontSize: 13, color: '#374151' }}>🕐 {b.startTime} – {b.endTime}</span>
              {b.expectedAttendees && <span style={{ fontSize: 13, color: '#374151' }}>👥 {b.expectedAttendees} people</span>}
            </div>

            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>
              <span style={{ fontWeight: 500 }}>Purpose:</span> {b.purpose}
            </p>

            {b.adminNote && (
              <div style={{ padding: '6px 10px', borderRadius: 6, background: '#f8fafc', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  <span style={{ fontWeight: 600 }}>Admin note:</span> {b.adminNote}
                </p>
              </div>
            )}

            {b.cancellationReason && (
              <div style={{ padding: '6px 10px', borderRadius: 6, background: '#f8fafc', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  <span style={{ fontWeight: 600 }}>Cancellation reason:</span> {b.cancellationReason}
                </p>
              </div>
            )}

            {(b.status === 'PENDING' || b.status === 'APPROVED') && (
              <button onClick={() => handleCancel(b.id)} style={{
                marginTop: 4, padding: '6px 14px', background: '#fff',
                color: '#dc2626', border: '1px solid #fecaca',
                borderRadius: 6, cursor: 'pointer', fontSize: 13
              }}>Cancel Booking</button>
            )}
          </div>
        );
      })}
    </div>
  );
}