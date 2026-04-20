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

  if (loading) return <div className="page-block">Loading your bookings...</div>;
  if (error) return <div className="page-block"><p className="muted">{error}</p></div>;

  return (
    <div className="page-block narrow">
      <section className="page-hero">
        <p className="kicker">Bookings</p>
        <h1 className="page-hero-title">My Bookings</h1>
        <p className="muted">Track status, review details, and cancel when plans change.</p>
      </section>

      {bookings.length === 0 && (
        <article className="card">
          <p className="muted">You have no bookings yet.</p>
        </article>
      )}

      {bookings.map((b) => (
        <article key={b.id} className="card">
          <div className="inline-actions spread">
            <strong>{b.resourceName}</strong>
            <span className="status-pill" style={{ background: STATUS_COLORS[b.status] }}>
              {b.status}
            </span>
          </div>

          <p className="booking-meta">
            📅 {b.bookingDate} &nbsp; 🕐 {b.startTime} – {b.endTime}
          </p>
          <p className="muted">
            Purpose: {b.purpose}
          </p>

          {b.expectedAttendees && (
            <p className="muted">
              Attendees: {b.expectedAttendees}
            </p>
          )}

          {b.adminNote && (
            <p className="muted">
              Admin note: {b.adminNote}
            </p>
          )}

          {b.cancellationReason && (
            <p className="muted">
              Cancellation reason: {b.cancellationReason}
            </p>
          )}

          {(b.status === 'PENDING' || b.status === 'APPROVED') && (
            <button className="btn-danger" onClick={() => handleCancel(b.id)}>
              Cancel Booking
            </button>
          )}
        </article>
      ))}
    </div>
  );
}