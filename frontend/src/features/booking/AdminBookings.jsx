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
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Booking Governance</p>
        <h1 className="page-hero-title">All Bookings</h1>
        <p className="muted">Review, approve, and reject booking requests across the campus.</p>
      </section>

      <div className="inline-actions tabs">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? 'tab active' : 'tab'}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="muted">{error}</p>}

      {!loading && bookings.length === 0 && (
        <article className="card"><p className="muted">No bookings found.</p></article>
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
            👤 {b.userName} — {b.userEmail}
          </p>
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

          {b.status === 'PENDING' && (
            <div className="inline-actions">
              <button className="btn-primary" onClick={() => handleApprove(b.id)}>
                Approve
              </button>
              <button className="btn-danger" onClick={() => handleReject(b.id)}>
                Reject
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}