import { useEffect, useState } from 'react';
import { bookingApi } from '../../api/bookingApi';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  APPROVED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#9ca3af',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation (optional):');
    try {
      await bookingApi.cancelBooking(id, reason);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2>My Bookings</h2>

      {bookings.length === 0 && (
        <p style={{ color: '#6b7280' }}>You have no bookings yet.</p>
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

          {b.cancellationReason && (
            <p style={{ margin: '4px 0', color: '#6b7280', fontStyle: 'italic' }}>
              Cancellation reason: {b.cancellationReason}
            </p>
          )}

          {(b.status === 'PENDING' || b.status === 'APPROVED') && (
            <button
              onClick={() => handleCancel(b.id)}
              style={{
                marginTop: 10,
                padding: '6px 14px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Cancel Booking
            </button>
          )}
        </div>
      ))}
    </div>
  );
}