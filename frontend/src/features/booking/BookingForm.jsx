import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { getAllResources } from '../../api/resourceApi';

const DURATION_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

const BUSY_CONFIG = {
  QUIET:    { emoji: '🟢', label: 'Quiet',    color: '#16a34a' },
  MODERATE: { emoji: '🟡', label: 'Moderate', color: '#d97706' },
  PEAK:     { emoji: '🔴', label: 'Peak',     color: '#dc2626' },
};

const DAY_START = 8;
const DAY_END   = 20;
const DAY_HOURS = DAY_END - DAY_START;

function timeToPercent(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return ((h + m / 60 - DAY_START) / DAY_HOURS) * 100;
}

export default function BookingForm({ onSuccess }) {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [form, setForm] = useState({
    resourceId: '', bookingDate: '', startTime: '',
    endTime: '', purpose: '', expectedAttendees: '',
  });
  const [duration, setDuration] = useState(60);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllResources()
      .then((data) => {
        const active = Array.isArray(data) ? data.filter((r) => r.status === 'ACTIVE') : [];
        setResources(active);
      })
      .catch(() => setResources([]));
  }, []);

  useEffect(() => {
    if (form.resourceId && form.bookingDate) {
      const today = new Date().toISOString().split('T')[0];
      const isToday = form.bookingDate === today;
      bookingApi.suggestSlots(form.resourceId, form.bookingDate, duration)
        .then((res) => {
          let slots = res.data;
          if (isToday) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            slots = slots.filter((s) => {
              const [slotHour, slotMin] = s.suggestedStart.split(':').map(Number);
              return slotHour > currentHour || (slotHour === currentHour && slotMin > currentMinutes);
            });
          }
          setSuggestions(slots);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [form.resourceId, form.bookingDate, duration]);

  const handleResourceChange = (e) => {
    const id = e.target.value;
    const resource = resources.find((r) => String(r.id) === id);
    setSelectedResource(resource || null);
    setForm({ ...form, resourceId: id });
  };

  const applySuggestion = (slot) => {
    setForm((prev) => ({ ...prev, startTime: slot.suggestedStart, endTime: slot.suggestedEnd }));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.resourceId) return setError('Please select a resource.');
    if (!form.bookingDate) return setError('Please select a booking date.');
    if (!form.startTime) return setError('Please select a start time.');
    if (!form.endTime) return setError('Please select an end time.');
    if (form.startTime >= form.endTime) return setError('End time must be after start time.');

    const [startH, startM] = form.startTime.split(':').map(Number);
    const [endH, endM] = form.endTime.split(':').map(Number);
    const selectedMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (selectedMinutes !== duration) {
      const label = DURATION_OPTIONS.find(d => d.value === duration)?.label || `${duration} min`;
      return setError(`Your time range is ${selectedMinutes} min but duration is set to ${label}. Please match them.`);
    }

    if (!form.purpose.trim()) return setError('Please enter the purpose of the booking.');

    if (form.expectedAttendees && selectedResource?.capacity) {
      if (parseInt(form.expectedAttendees) > selectedResource.capacity) {
        return setError(`Attendees (${form.expectedAttendees}) exceeds room capacity of ${selectedResource.capacity}.`);
      }
    }
    if (form.expectedAttendees && parseInt(form.expectedAttendees) < 1) {
      return setError('Attendees must be at least 1.');
    }

    const today = new Date().toISOString().split('T')[0];
    if (form.bookingDate === today) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      if (form.startTime < currentTime) return setError(`Start time ${form.startTime} is in the past.`);
    }

    setLoading(true);
    try {
      await bookingApi.createBooking({
        resourceId: Number(form.resourceId),
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      let msg = 'Booking failed. Please try again.';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message) { try { msg = JSON.parse(err.message).message || err.message; } catch { msg = err.message; } }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-shell">
      <section className="booking-card">
        <div className="booking-head-row">
          <button type="button" className="btn-outline" onClick={() => navigate('/bookings/my')}>
            Back to My Bookings
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate('/bookings/heatmap')}>
            Availability Heatmap
          </button>
        </div>

        <div className="booking-title-block">
          <p className="kicker">Booking Desk</p>
          <h2>New Booking Request</h2>
          <p className="muted">Choose a resource, pick a slot, and submit for admin approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form-grid">
          <div className="booking-field booking-field-full">
            <label htmlFor="resourceId">Resource</label>
            <select id="resourceId" name="resourceId" value={form.resourceId} onChange={handleResourceChange}>
              <option value="">Select a resource...</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.type} · {r.location} (Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          {selectedResource && (
            <div className="booking-resource-chip booking-field-full">
              <p className="booking-resource-name">{selectedResource.name}</p>
              <p className="booking-resource-meta">
                {selectedResource.location} · Max {selectedResource.capacity} people · {selectedResource.type}
              </p>
              {selectedResource.description && (
                <p className="booking-resource-desc">{selectedResource.description}</p>
              )}
            </div>
          )}

          <div className="booking-field">
            <label htmlFor="bookingDate">Date</label>
            <input
              id="bookingDate"
              type="date"
              name="bookingDate"
              value={form.bookingDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="booking-field">
            <label htmlFor="duration">Duration</label>
            <select id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {suggestions.length > 0 && (
            <div className="booking-suggestion-wrap booking-field-full">
              <p className="booking-suggestion-title">Smart slot suggestions</p>
              <div className="booking-timeline">
                {[8, 10, 12, 14, 16, 18, 20].map((h) => (
                  <span
                    key={h}
                    className="booking-timeline-tick"
                    style={{ left: `${((h - DAY_START) / DAY_HOURS) * 100}%` }}
                  >
                    {h}
                  </span>
                ))}
                {suggestions.map((s, i) => {
                  const left = timeToPercent(s.suggestedStart);
                  const right = timeToPercent(s.suggestedEnd);
                  const busy = BUSY_CONFIG[s.busyLevel] || BUSY_CONFIG.QUIET;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applySuggestion(s)}
                      className="booking-timeline-block"
                      style={{ left: `${left}%`, width: `${right - left}%`, background: busy.color }}
                      title={s.message}
                    />
                  );
                })}
              </div>

              <div className="booking-suggestion-list">
                {suggestions.map((s, i) => {
                  const busy = BUSY_CONFIG[s.busyLevel] || BUSY_CONFIG.QUIET;
                  return (
                    <button
                      type="button"
                      key={i}
                      className="booking-suggestion-item"
                      onClick={() => applySuggestion(s)}
                    >
                      <span>{s.message}</span>
                      <strong style={{ color: busy.color }}>{busy.emoji} {busy.label}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {form.resourceId && form.bookingDate && suggestions.length === 0 && (
            <div className="booking-notice warning booking-field-full">
              No available slots for the selected date and duration. Try a different date or shorter duration.
            </div>
          )}

          <div className="booking-field">
            <label htmlFor="startTime">Start Time</label>
            <input id="startTime" type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
          </div>

          <div className="booking-field">
            <label htmlFor="endTime">End Time</label>
            <input id="endTime" type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
          </div>

          <div className="booking-field booking-field-full">
            <label htmlFor="purpose">Purpose</label>
            <textarea
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              required
              rows={3}
              placeholder="e.g. Team meeting, lecture, workshop"
            />
          </div>

          <div className="booking-field booking-field-full">
            <label htmlFor="expectedAttendees">
              Expected Attendees
              {selectedResource && <span className="booking-cap-hint">(max {selectedResource.capacity})</span>}
            </label>
            <input
              id="expectedAttendees"
              type="number"
              name="expectedAttendees"
              value={form.expectedAttendees}
              onChange={handleChange}
              min={1}
              max={selectedResource?.capacity || undefined}
              placeholder={selectedResource ? `1 - ${selectedResource.capacity}` : 'Number of people'}
            />
          </div>

          {error && (
            <div className="booking-notice error booking-field-full">{error}</div>
          )}

          {success && (
            <div className="booking-notice success booking-field-full">
              Booking submitted successfully. Waiting for admin approval.
            </div>
          )}

          <button type="submit" className="btn-primary btn-wide booking-submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>
      </section>
    </div>
  );
}