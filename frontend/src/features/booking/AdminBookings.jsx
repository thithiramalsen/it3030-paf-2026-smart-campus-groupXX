import { useEffect, useState } from 'react';
import { bookingApi } from '../../api/bookingApi';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  APPROVED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#9ca3af',
};

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadBookings(filter);
  }, [filter]);

  const handleApprove = async (id) => {
    const note = prompt('Approval note (optional):');
    try {
      await bookingApi.approveBooking(id, note);
      loadBookings(filter);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking.');
    }
  };

  const handleReject = async (id) => {
    const note = prompt('Reason for rejection:');
    if (!note) return alert('Rejection reason is required.');
    try {
      await bookingApi.rejectBooking(id, note);
      loadBookings(filter);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking.');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2>All Bookings</h2>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #e5e7eb',
              background: filter === s ? '#2563eb' : '#fff',
              color: filter === s ? '#fff' : '#374151',
              cursor: 'pointer',
              fontWeight: filter === s ? 600 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && bookings.length === 0 && (
        <p style={{ color: '#6b7280' }}>No bookings found.</p>
      )}

      {bookings.map((b) => (
        <div
          key={b.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 16 }}>{b.resourceName}</strong>
            <span style={{
              background: STATUS_COLORS[b.status],
              color: '#fff',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 13,
            }}>
              {b.status}
            </span>
          </div>

          <p style={{ margin: '8px 0 4px', color: '#374151' }}>
            👤 {b.userName} — {b.userEmail}
          </p>
          <p style={{ margin: '4px 0', color: '#374151' }}>
            📅 {b.bookingDate} &nbsp; 🕐 {b.startTime} – {b.endTime}
          </p>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>
            Purpose: {b.purpose}
          </p>

          {b.expectedAttendees && (
            <p style={{ margin: '4px 0', color: '#6b7280' }}>
              Attendees: {b.expectedAttendees}
            </p>
          )}

          {b.adminNote && (
            <p style={{ margin: '4px 0', color: '#6b7280', fontStyle: 'italic' }}>
              Admin note: {b.adminNote}
            </p>
          )}

          {b.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                onClick={() => handleApprove(b.id)}
                style={{
                  padding: '6px 14px',
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(b.id)}
                style={{
                  padding: '6px 14px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}