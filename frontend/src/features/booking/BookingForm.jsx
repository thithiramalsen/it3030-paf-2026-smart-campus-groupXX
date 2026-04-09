import { useEffect, useState } from 'react';
import { bookingApi } from '../../api/bookingApi';

export default function BookingForm({ onSuccess }) {
  const [form, setForm] = useState({
    resourceId: '',
    resourceName: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load slot suggestions when resource and date are both filled
  useEffect(() => {
    if (form.resourceId && form.bookingDate) {
      bookingApi
        .suggestSlots(form.resourceId, form.bookingDate, 60)
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [form.resourceId, form.bookingDate]);

  const applySuggestion = (slot) => {
    setForm((prev) => ({
      ...prev,
      startTime: slot.suggestedStart,
      endTime: slot.suggestedEnd,
    }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await bookingApi.createBooking({
        ...form,
        expectedAttendees: form.expectedAttendees
          ? parseInt(form.expectedAttendees)
          : null,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <h2>Request a Booking</h2>

      {/* Smart Slot Suggestions */}
      {suggestions.length > 0 && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
            💡 Available slots — click to auto-fill:
          </p>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applySuggestion(s)}
              style={{
                display: 'block',
                width: '100%',
                marginBottom: 6,
                padding: '6px 12px',
                background: '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {s.message}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Resource ID</label>
          <input
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Resource Name</label>
          <input
            name="resourceName"
            value={form.resourceName}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Date</label>
          <input
            type="date"
            name="bookingDate"
            value={form.bookingDate}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Start Time</label>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>End Time</label>
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Purpose</label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            required
            rows={3}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Expected Attendees</label>
          <input
            type="number"
            name="expectedAttendees"
            value={form.expectedAttendees}
            onChange={handleChange}
            min={1}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>
        )}
        {success && (
          <p style={{ color: 'green', marginBottom: 12 }}>
            Booking request submitted successfully!
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}