import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/bookingApi';
import { getAllResources } from '../../api/resourceApi';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export default function ResourceHeatmap() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [mode, setMode] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySchedule, setDailySchedule] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllResources()
      .then((data) => {
        const active = Array.isArray(data) ? data.filter((r) => r.status === 'ACTIVE') : [];
        setResources(active);
      })
      .catch(() => setResources([]));
  }, []);

  const handleResourceChange = (e) => {
    const id = e.target.value;
    const resource = resources.find((r) => String(r.id) === id);
    setSelectedResource(resource || null);
    setDailySchedule(null);
    setMatrix(null);
  };

  const generate = async () => {
    if (!selectedResource) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'daily') {
        const res = await bookingApi.getDailySchedule(selectedResource.id, selectedDate);
        setDailySchedule(res.data);
        setMatrix(null);
      } else {
        const res = await bookingApi.getScheduleMatrix(selectedResource.id, 14);
        setMatrix(res.data);
        setDailySchedule(null);
      }
    } catch {
      setError('Failed to generate schedule.');
    } finally {
      setLoading(false);
    }
  };

  const dates = matrix ? Object.keys(matrix) : [];

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/bookings/new')} style={{
        marginBottom: 16, padding: '6px 12px', background: '#fff',
        border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13
      }}>← Back to New Booking</button>

      <h2>Resource Availability Heatmap</h2>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => { setMode('daily'); setMatrix(null); setDailySchedule(null); }} style={{
          padding: '6px 16px', borderRadius: 20, border: '1px solid #e5e7eb',
          background: mode === 'daily' ? '#2563eb' : '#fff',
          color: mode === 'daily' ? '#fff' : '#374151', cursor: 'pointer'
        }}>📅 Daily View</button>
        <button onClick={() => { setMode('14days'); setMatrix(null); setDailySchedule(null); }} style={{
          padding: '6px 16px', borderRadius: 20, border: '1px solid #e5e7eb',
          background: mode === '14days' ? '#2563eb' : '#fff',
          color: mode === '14days' ? '#fff' : '#374151', cursor: 'pointer'
        }}>📊 14-Day Table</button>
      </div>

      {/* Resource dropdown */}
      <div style={{ marginBottom: 12 }}>
        <label>Select Resource</label>
        <select onChange={handleResourceChange} defaultValue=""
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }}>
          <option value="">-- Choose a resource --</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.type} — {r.location} (Capacity: {r.capacity})
            </option>
          ))}
        </select>
      </div>

      {/* Resource info */}
      {selectedResource && (
        <div style={{ padding: 12, marginBottom: 12, borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <strong>{selectedResource.name}</strong>
          <p style={{ margin: '4px 0', fontSize: 13, color: '#0369a1' }}>
            📍 {selectedResource.location} &nbsp;|&nbsp;
            👥 Capacity: {selectedResource.capacity} &nbsp;|&nbsp;
            🏷️ {selectedResource.type}
          </p>
        </div>
      )}

      {/* Date picker for daily mode */}
      {mode === 'daily' && (
        <div style={{ marginBottom: 12 }}>
          <label>Select Date</label>
          <input type="date" value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setDailySchedule(null); }}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </div>
      )}

      {mode === '14days' && (
        <p style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>
          Shows bookings for each hour across the next 14 days. 🔴 = Booked &nbsp; 🟢 = Available
        </p>
      )}

      <button onClick={generate} disabled={loading || !selectedResource} style={{
        width: '100%', padding: '10px', background: '#2563eb', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 20,
        opacity: !selectedResource ? 0.5 : 1
      }}>
        {loading ? 'Loading...' : mode === 'daily' ? '📅 Show Daily Schedule' : '📊 Show 14-Day Table'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Daily schedule */}
      {dailySchedule && (
        <div>
          <h3 style={{ marginBottom: 12 }}>
            Schedule for {selectedResource?.name} on {selectedDate}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {HOURS.map((h) => {
              const isBooked = dailySchedule[h] === 'BOOKED';
              return (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 50, fontSize: 13, color: '#6b7280', textAlign: 'right' }}>{h}:00</span>
                  <div style={{
                    flex: 1, height: 36, borderRadius: 6,
                    background: isBooked ? '#ef4444' : '#22c55e',
                    display: 'flex', alignItems: 'center', paddingLeft: 12
                  }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {isBooked ? '🔴 Booked' : '🟢 Available'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 14-day table */}
      {matrix && dates.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <h3 style={{ marginBottom: 12 }}>14-Day Schedule for {selectedResource?.name}</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 8px', background: '#f3f4f6', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: 50 }}>
                  Hour
                </th>
                {dates.map((d) => {
                  const date = new Date(d);
                  const isToday = d === new Date().toISOString().split('T')[0];
                  return (
                    <th key={d} style={{
                      padding: '4px 6px', border: '1px solid #e5e7eb', textAlign: 'center',
                      minWidth: 52, background: isToday ? '#dbeafe' : '#f3f4f6',
                      color: isToday ? '#1d4ed8' : '#374151', fontWeight: isToday ? 700 : 500
                    }}>
                      <div>{date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>
                        {date.toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h) => (
                <tr key={h}>
                  <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb', background: '#f9fafb', fontWeight: 600, fontSize: 12 }}>
                    {h}:00
                  </td>
                  {dates.map((d) => {
                    const bookedHours = matrix[d] || [];
                    const isBooked = bookedHours.includes(h);
                    return (
                      <td key={d} style={{
                        padding: '4px', border: '1px solid #e5e7eb', textAlign: 'center',
                        background: isBooked ? '#fee2e2' : '#f0fdf4',
                      }}>
                        <span style={{ fontSize: 14 }}>{isBooked ? '🔴' : '🟢'}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🟢</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🔴</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Booked</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: '#dbeafe', padding: '1px 6px', borderRadius: 4, fontSize: 11, color: '#1d4ed8', fontWeight: 700 }}>Today</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}