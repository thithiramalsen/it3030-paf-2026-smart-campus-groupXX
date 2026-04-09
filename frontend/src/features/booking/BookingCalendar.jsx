import { useEffect, useState } from 'react';
import { bookingApi } from '../../api/bookingApi';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  PENDING:   '#f59e0b',
  APPROVED:  '#22c55e',
  REJECTED:  '#ef4444',
  CANCELLED: '#9ca3af',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function BookingCalendar() {
  const [bookings, setBookings] = useState([]);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    bookingApi.getMyBookings()
      .then((res) => setBookings(res.data))
      .catch(() => setBookings([]));
  }, []);

  const prevMonth = () => {
    setCurrent((c) => c.month === 0
      ? { year: c.year - 1, month: 11 }
      : { year: c.year, month: c.month - 1 });
    setSelected(null);
  };

  const nextMonth = () => {
    setCurrent((c) => c.month === 11
      ? { year: c.year + 1, month: 0 }
      : { year: c.year, month: c.month + 1 });
    setSelected(null);
  };

  // Build calendar grid
  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  // Group bookings by date
  const bookingsByDate = {};
  bookings.forEach((b) => {
    const key = b.bookingDate;
    if (!bookingsByDate[key]) bookingsByDate[key] = [];
    bookingsByDate[key].push(b);
  });

  const getDateKey = (day) => {
    const m = String(current.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${current.year}-${m}-${d}`;
  };

  const isToday = (day) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  const selectedBookings = selected ? (bookingsByDate[getDateKey(selected)] || []) : [];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>My Booking Calendar</h2>
        <button onClick={() => navigate('/bookings/new')} style={{
          padding: '8px 16px', background: '#2563eb', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer'
        }}>+ New Booking</button>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff' }}>‹</button>
        <strong style={{ fontSize: 18 }}>{MONTHS[current.month]} {current.year}</strong>
        <button onClick={nextMonth} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff' }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = getDateKey(day);
          const dayBookings = bookingsByDate[key] || [];
          const isSelected = selected === day;

          return (
            <div key={i} onClick={() => setSelected(day)} style={{
              minHeight: 64, padding: 6, borderRadius: 8, cursor: 'pointer',
              border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
              background: isToday(day) ? '#eff6ff' : '#fff',
            }}>
              <div style={{
                fontSize: 13, fontWeight: isToday(day) ? 700 : 400,
                color: isToday(day) ? '#2563eb' : '#374151',
                marginBottom: 4
              }}>{day}</div>
              {dayBookings.slice(0, 2).map((b, j) => (
                <div key={j} style={{
                  fontSize: 10, borderRadius: 4, padding: '1px 4px', marginBottom: 2,
                  background: STATUS_COLORS[b.status], color: '#fff',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                }}>{b.resourceName}</div>
              ))}
              {dayBookings.length > 2 && (
                <div style={{ fontSize: 10, color: '#6b7280' }}>+{dayBookings.length - 2} more</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day bookings */}
      {selected && (
        <div style={{ marginTop: 20, padding: 16, border: '1px solid #e5e7eb', borderRadius: 10 }}>
          <h3 style={{ margin: '0 0 12px' }}>
            {MONTHS[current.month]} {selected}, {current.year}
          </h3>
          {selectedBookings.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No bookings on this day.</p>
          ) : (
            selectedBookings.map((b) => (
              <div key={b.id} style={{
                padding: 12, marginBottom: 8, borderRadius: 8,
                border: '1px solid #e5e7eb', background: '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{b.resourceName}</strong>
                  <span style={{
                    background: STATUS_COLORS[b.status], color: '#fff',
                    padding: '2px 8px', borderRadius: 10, fontSize: 12
                  }}>{b.status}</span>
                </div>
                <p style={{ margin: '4px 0', color: '#6b7280', fontSize: 13 }}>
                  🕐 {b.startTime} – {b.endTime}
                </p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>{b.purpose}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}