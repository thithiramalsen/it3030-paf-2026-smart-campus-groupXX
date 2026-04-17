import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { getResourceById } from '../../api/resourceApi';

const DURATION_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

const BUSY_CONFIG = {
  QUIET:    { emoji: '🟢', label: 'Quiet',    color: '#22c55e' },
  MODERATE: { emoji: '🟡', label: 'Moderate', color: '#f59e0b' },
  PEAK:     { emoji: '🔴', label: 'Peak',     color: '#ef4444' },
};

const DAY_START = 8;  // 8 AM
const DAY_END   = 20; // 8 PM
const DAY_HOURS = DAY_END - DAY_START;

function timeToPercent(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return ((h + m / 60 - DAY_START) / DAY_HOURS) * 100;
}

export default function BookingForm({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const selectedResourceId = searchParams.get('resourceId') || '';

  const [form, setForm] = useState({
    resourceId: selectedResourceId,
    resourceName: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });
  const [duration, setDuration] = useState(60);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!selectedResourceId) return;

    let alive = true;

    const hydrateSelectedResource = async () => {
      try {
        const resource = await getResourceById(selectedResourceId);
        if (!alive) return;
        setForm((prev) => ({
          ...prev,
          resourceId: selectedResourceId,
          resourceName: prev.resourceName || resource?.name || '',
        }));
      } catch {
        if (!alive) return;
        setForm((prev) => ({
          ...prev,
          resourceId: selectedResourceId,
        }));
      }
    };

    hydrateSelectedResource();

    return () => {
      alive = false;
    };
  }, [selectedResourceId]);

  useEffect(() => {
    if (form.resourceId && form.bookingDate) {
      bookingApi
        .suggestSlots(form.resourceId, form.bookingDate, duration)
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [form.resourceId, form.bookingDate, duration]);

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
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
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
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <h2>Request a Booking</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Resource ID</label>
          <input name="resourceId" value={form.resourceId} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Resource Name</label>
          <input name="resourceName" value={form.resourceName} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Date</label>
          <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>

        {/* Duration dropdown */}
        <div style={{ marginBottom: 16 }}>
          <label>Duration</label>
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }}>
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Smart Slot Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>💡 Available slots — click to auto-fill:</p>

            {/* Visual timeline */}
            <div style={{ position: 'relative', height: 32, background: '#f3f4f6', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
              {/* Time labels */}
              {[8, 10, 12, 14, 16, 18, 20].map((h) => (
                <span key={h} style={{
                  position: 'absolute',
                  left: `${((h - DAY_START) / DAY_HOURS) * 100}%`,
                  top: 2, fontSize: 9, color: '#9ca3af', transform: 'translateX(-50%)'
                }}>{h}:00</span>
              ))}
              {/* Slot bars */}
              {suggestions.map((s, i) => {
                const left = timeToPercent(s.suggestedStart);
                const right = timeToPercent(s.suggestedEnd);
                const busy = BUSY_CONFIG[s.busyLevel] || BUSY_CONFIG.QUIET;
                return (
                  <div key={i} onClick={() => applySuggestion(s)} style={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${right - left}%`,
                    top: 14, height: 14,
                    background: busy.color,
                    borderRadius: 4,
                    cursor: 'pointer',
                    opacity: 0.85,
                  }} title={s.message} />
                );
              })}
            </div>

            {/* Slot chips */}
            {suggestions.map((s, i) => {
              const busy = BUSY_CONFIG[s.busyLevel] || BUSY_CONFIG.QUIET;
              return (
                <div key={i} onClick={() => applySuggestion(s)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', marginBottom: 6, borderRadius: 8, cursor: 'pointer',
                  border: '1px solid #e5e7eb', background: '#f9fafb',
                }}>
                  <span style={{ fontSize: 14 }}>{s.message}</span>
                  <span style={{ fontSize: 12, color: busy.color, fontWeight: 600 }}>
                    {busy.emoji} {busy.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label>Start Time</label>
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>End Time</label>
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Purpose</label>
          <textarea name="purpose" value={form.purpose} onChange={handleChange} required rows={3}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Expected Attendees</label>
          <input type="number" name="expectedAttendees" value={form.expectedAttendees}
            onChange={handleChange} min={1}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>

        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: 12 }}>Booking request submitted successfully!</p>}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '10px', background: '#2563eb', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer'
        }}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}