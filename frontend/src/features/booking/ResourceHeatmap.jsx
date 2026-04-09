import { useState } from 'react';
import { bookingApi } from '../../api/bookingApi';
import { useNavigate } from 'react-router-dom';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
const DAYS_AHEAD = 14;

function getHeatColor(count) {
  if (count === 0) return '#f3f4f6';
  if (count === 1) return '#bbf7d0';
  if (count === 2) return '#4ade80';
  if (count === 3) return '#f59e0b';
  return '#ef4444';
}

function getLabel(count) {
  if (count === 0) return 'Free';
  if (count === 1) return 'Low';
  if (count === 2) return 'Moderate';
  if (count === 3) return 'Busy';
  return 'Peak';
}

export default function ResourceHeatmap() {
  const [resourceId, setResourceId] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const generateHeatmap = async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const hourCounts = {};
      HOURS.forEach((h) => { hourCounts[h] = 0; });

      for (let d = 0; d < DAYS_AHEAD; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        try {
          const res = await bookingApi.suggestSlots(resourceId, dateStr, 60);
          const freeStarts = res.data.map((s) => parseInt(s.suggestedStart.split(':')[0]));
          HOURS.forEach((h) => {
            if (!freeStarts.includes(h)) hourCounts[h]++;
          });
        } catch { }
      }

      setHeatmap(hourCounts);
    } catch {
      setError('Failed to generate heatmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>

      <button onClick={() => navigate('/bookings/new')} style={{
        marginBottom: 16, padding: '6px 12px', background: '#fff',
        border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13
      }}>← Back to New Booking</button>

      <h2>Resource Availability Heatmap</h2>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>
        See which hours are busiest for a resource over the next 14 days.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input placeholder="Resource ID" value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
        <input placeholder="Resource Name (optional)" value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
          style={{ flex: 2, padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
        <button onClick={generateHeatmap} disabled={loading || !resourceId} style={{
          padding: '8px 16px', background: '#2563eb', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer'
        }}>
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {heatmap && (
        <div>
          <h3 style={{ marginBottom: 12 }}>
            Busy hours for {resourceName || resourceId}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HOURS.map((h) => {
              const count = heatmap[h] || 0;
              const pct = Math.round((count / DAYS_AHEAD) * 100);
              const colorKey = Math.round(count / DAYS_AHEAD * 4);
              return (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 50, fontSize: 13, color: '#6b7280', textAlign: 'right' }}>{h}:00</span>
                  <div style={{ flex: 1, height: 32, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: getHeatColor(colorKey), borderRadius: 6,
                      transition: 'width 0.5s ease', minWidth: pct > 0 ? 8 : 0,
                    }} />
                  </div>
                  <span style={{ width: 70, fontSize: 12, fontWeight: 600,
                    color: getHeatColor(colorKey) === '#f3f4f6' ? '#9ca3af' : '#374151' }}>
                    {getLabel(colorKey)} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { color: '#f3f4f6', label: 'Free' },
              { color: '#bbf7d0', label: 'Low' },
              { color: '#4ade80', label: 'Moderate' },
              { color: '#f59e0b', label: 'Busy' },
              { color: '#ef4444', label: 'Peak' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 16, background: l.color, borderRadius: 4, border: '1px solid #e5e7eb' }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}