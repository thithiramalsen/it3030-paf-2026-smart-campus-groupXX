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

const inputStyle = {
  display: 'block', width: '100%', padding: '11px 14px',
  marginTop: 6, borderRadius: 8, border: '1px solid #e5e7eb',
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
  background: '#fff', color: '#111827',
};

const labelStyle = {
  fontSize: 14, fontWeight: 600, color: '#374151',
};



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
        <div style={{
      maxWidth: 800,maxHeight: 1000, margin: '40px auto', padding: '40px',
      background: '#ffffff', borderRadius: 20,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
      border: '1px solid #e5e7eb',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button type="button" onClick={() => navigate('/bookings/my')} style={{
          padding: '6px 12px', background: 'transparent', border: '1px solid #e5e7eb',
          borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#6b7280'
        }}>← Back</button>
        <button type="button" onClick={() => navigate('/bookings/heatmap')} style={{
          padding: '6px 12px', background: 'transparent', border: '1px solid #e5e7eb',
          borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#6b7280'
        }}>📊 Heatmap</button>
      </div>

        <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#111827' }}>New Booking</h2>
        <p style={{ margin: '0 0 28px', fontSize: 15, color: '#6b7280' }}>Fill in the details to request a resource booking.</p>

      <form onSubmit={handleSubmit}>

        {/* Resource */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Resource</label>
          <select name="resourceId" value={form.resourceId} onChange={handleResourceChange} style={inputStyle}>
            <option value="">Select a resource...</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.type} · {r.location} (Cap: {r.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Resource info */}
        {selectedResource && (
          <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{selectedResource.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              📍 {selectedResource.location} &nbsp;·&nbsp; 👥 Max {selectedResource.capacity} people &nbsp;·&nbsp; 🏷️ {selectedResource.type}
            </p>
            {selectedResource.description && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{selectedResource.description}</p>
            )}
          </div>
        )}

        {/* Date + Duration row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" name="bookingDate" value={form.bookingDate}
              onChange={handleChange} required min={new Date().toISOString().split('T')[0]}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Duration</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={inputStyle}>
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Slot suggestions */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
              💡 Available slots
              <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>— click to auto-fill</span>
            </p>

            {/* Timeline bar */}
            <div style={{ position: 'relative', height: 28, background: '#e5e7eb', borderRadius: 6, marginBottom: 10, overflow: 'hidden' }}>
              {[8,10,12,14,16,18,20].map((h) => (
                <span key={h} style={{
                  position: 'absolute', left: `${((h - DAY_START) / DAY_HOURS) * 100}%`,
                  top: 2, fontSize: 8, color: '#9ca3af', transform: 'translateX(-50%)'
                }}>{h}</span>
              ))}
              {suggestions.map((s, i) => {
                const left = timeToPercent(s.suggestedStart);
                const right = timeToPercent(s.suggestedEnd);
                const busy = BUSY_CONFIG[s.busyLevel] || BUSY_CONFIG.QUIET;
                return (
                  <div key={i} onClick={() => applySuggestion(s)} style={{
                    position: 'absolute', left: `${left}%`, width: `${right - left}%`,
                    top: 12, height: 12, background: busy.color, borderRadius: 3,
                    cursor: 'pointer', opacity: 0.8,
                  }} title={s.message} />
                );
              })}
            </div>

            {/* Scrollable chips */}
            <div style={{ maxHeight: 150, overflowY: suggestions.length > 3 ? 'auto' : 'visible' }}>
              {suggestions.map((s, i) => {
                const busy = BUSY_CONFIG[s.busyLevel] || BUSY_CONFIG.QUIET;
                return (
                  <div key={i} onClick={() => applySuggestion(s)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 10px', marginBottom: 4, borderRadius: 6, cursor: 'pointer',
                    border: '1px solid #e5e7eb', background: '#fff', fontSize: 13,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <span style={{ color: '#374151' }}>{s.message}</span>
                    <span style={{ fontSize: 11, color: busy.color, fontWeight: 600, marginLeft: 8 }}>
                      {busy.emoji} {busy.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {suggestions.length > 3 && (
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '6px 0 0' }}>scroll for more ↕</p>
            )}
          </div>
        )}

        {/* No slots warning */}
        {form.resourceId && form.bookingDate && suggestions.length === 0 && (
          <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>
              ⚠️ No available slots for the selected date and duration. Try a different date or shorter duration.
            </p>
          </div>
        )}

        {/* Start + End time row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Start Time</label>
            <input type="time" name="startTime" value={form.startTime}
              onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End Time</label>
            <input type="time" name="endTime" value={form.endTime}
              onChange={handleChange} required style={inputStyle} />
          </div>
        </div>

        {/* Purpose */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Purpose</label>
          <textarea name="purpose" value={form.purpose} onChange={handleChange}
            required rows={3} placeholder="e.g. Team meeting, Lecture, Workshop..."
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {/* Attendees */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>
            Expected Attendees
            {selectedResource && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>(max {selectedResource.capacity})</span>}
          </label>
          <input type="number" name="expectedAttendees" value={form.expectedAttendees}
            onChange={handleChange} min={1} max={selectedResource?.capacity || undefined}
            placeholder={selectedResource ? `1 – ${selectedResource.capacity}` : 'Number of people'}
            style={inputStyle} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>⚠️ {error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ margin: 0, color: '#16a34a', fontSize: 13 }}>✅ Booking submitted! Waiting for admin approval.</p>
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '11px', background: loading ? '#93c5fd' : '#2563eb',
          color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
          fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.2
        }}>
          {loading ? 'Submitting...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}