import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarClock, HardDrive, Ticket, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApi } from '../api/adminApi';
import { bookingApi } from '../api/bookingApi';
import { getAllResources } from '../api/resourceApi';
import { getAllTickets } from '../api/ticketsApi';

const CHART_COLORS = ['#0f766e', '#0e7490', '#d97706', '#be123c', '#4f46e5', '#15803d', '#6b7280'];

function normalizeKey(value, fallback) {
  if (value == null || value === '') return fallback;
  return String(value).trim().toUpperCase();
}

function formatLabel(value) {
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function countBy(list, selector, fallback = 'UNKNOWN') {
  return list.reduce((acc, item) => {
    const key = normalizeKey(selector(item), fallback);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function toChartData(counts) {
  return Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .map(([key, value], index) => ({
      name: formatLabel(key),
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
}

function buildMonthlyTrend(bookings, tickets, monthsBack = 6) {
  const monthKeys = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(getMonthKey(date));
  }

  const template = monthKeys.reduce((acc, key) => {
    acc[key] = { month: getMonthLabel(key), bookings: 0, tickets: 0 };
    return acc;
  }, {});

  bookings.forEach((item) => {
    const date = parseDate(item.createdAt || item.createdDate || item.date);
    if (!date) return;
    const key = getMonthKey(date);
    if (template[key]) template[key].bookings += 1;
  });

  tickets.forEach((item) => {
    const date = parseDate(item.createdAt || item.createdDate || item.date);
    if (!date) return;
    const key = getMonthKey(date);
    if (template[key]) template[key].tickets += 1;
  });

  return monthKeys.map((key) => template[key]);
}

function RingChartCard({ title, data, emptyMessage }) {
  return (
    <section className="card">
      <h4>{title}</h4>
      {data.length === 0 && <p className="muted">{emptyMessage}</p>}
      {data.length > 0 && (
        <div className="analytics-chart-shell">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={96} paddingAngle={3}>
                {data.map((entry) => (
                  <Cell key={`${title}-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="analytics-legend-list">
            {data.map((item) => (
              <div key={`${title}-legend-${item.name}`} className="analytics-legend-item">
                <span className="analytics-dot" style={{ background: item.fill }} />
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function BarChartCard({ title, data, color = '#0e7490', emptyMessage }) {
  return (
    <section className="card">
      <h4>{title}</h4>
      {data.length === 0 && <p className="muted">{emptyMessage}</p>}
      {data.length > 0 && (
        <div className="analytics-chart-shell">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ left: 8, right: 8, top: 12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0e4" />
              <XAxis dataKey="name" tick={{ fill: '#4b5f67', fontSize: 12 }} />
              <YAxis tick={{ fill: '#4b5f67', fontSize: 12 }} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(15, 118, 110, 0.08)' }} />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [sourceErrors, setSourceErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);

  const loadAnalytics = async () => {
    setLoading(true);
    setSourceErrors([]);

    const [usersRes, bookingsRes, ticketsRes, resourcesRes] = await Promise.allSettled([
      adminApi.getUsers(),
      bookingApi.getAllBookings(),
      getAllTickets(),
      getAllResources(),
    ]);

    const failedSources = [];

    if (usersRes.status === 'fulfilled') {
      setUsers(usersRes.value?.data || []);
    } else {
      setUsers([]);
      failedSources.push('Users');
    }

    if (bookingsRes.status === 'fulfilled') {
      setBookings(bookingsRes.value?.data || []);
    } else {
      setBookings([]);
      failedSources.push('Bookings');
    }

    if (ticketsRes.status === 'fulfilled') {
      setTickets(ticketsRes.value?.data || []);
    } else {
      setTickets([]);
      failedSources.push('Tickets');
    }

    if (resourcesRes.status === 'fulfilled') {
      setResources(resourcesRes.value || []);
    } else {
      setResources([]);
      failedSources.push('Resources');
    }

    setSourceErrors(failedSources);
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const userRoles = useMemo(() => countBy(users, (item) => item.role), [users]);
  const userStatuses = useMemo(() => countBy(users, (item) => item.accountStatus), [users]);
  const bookingStatuses = useMemo(() => countBy(bookings, (item) => item.status), [bookings]);
  const ticketStatuses = useMemo(() => countBy(tickets, (item) => item.status), [tickets]);
  const ticketPriorities = useMemo(() => countBy(tickets, (item) => item.priority), [tickets]);
  const resourceTypes = useMemo(() => countBy(resources, (item) => item.type), [resources]);
  const resourceStatuses = useMemo(() => countBy(resources, (item) => item.status), [resources]);

  const userRoleData = useMemo(() => toChartData(userRoles), [userRoles]);
  const bookingStatusData = useMemo(() => toChartData(bookingStatuses), [bookingStatuses]);
  const ticketStatusData = useMemo(() => toChartData(ticketStatuses), [ticketStatuses]);
  const ticketPriorityData = useMemo(() => toChartData(ticketPriorities), [ticketPriorities]);
  const resourceTypeData = useMemo(() => toChartData(resourceTypes), [resourceTypes]);
  const resourceStatusData = useMemo(() => toChartData(resourceStatuses), [resourceStatuses]);
  const trendData = useMemo(() => buildMonthlyTrend(bookings, tickets, 6), [bookings, tickets]);

  const approvedBookings = bookingStatuses.APPROVED || 0;
  const bookingApprovalRate = bookings.length > 0 ? Math.round((approvedBookings / bookings.length) * 100) : 0;

  if (loading) {
    return <div className="page-block">Loading analytics...</div>;
  }

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">Administration</p>
        <h1 className="page-hero-title">Admin Analytics</h1>
        <p className="muted">System-wide visibility across users, bookings, tickets, and resources.</p>
      </section>

      {sourceErrors.length > 0 && (
        <article className="card">
          <h3>Partial data warning</h3>
          <p className="muted">Could not load: {sourceErrors.join(', ')}. Other analytics are still shown.</p>
        </article>
      )}

      <div className="card-grid four">
        <article className="card stat">
          <div className="feature-icon sky"><Users size={18} /></div>
          <h3>Total users</h3>
          <p>{users.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon brand"><CalendarClock size={18} /></div>
          <h3>Total bookings</h3>
          <p>{bookings.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon amber"><Ticket size={18} /></div>
          <h3>Total tickets</h3>
          <p>{tickets.length}</p>
          <div className="stat-line" />
        </article>
        <article className="card stat">
          <div className="feature-icon rose"><HardDrive size={18} /></div>
          <h3>Total resources</h3>
          <p>{resources.length}</p>
          <div className="stat-line" />
        </article>
      </div>

      <article className="card">
        <div className="feature-icon brand"><BarChart3 size={18} /></div>
        <h3>Analytics controls</h3>
        <p className="feature-meta">Refresh insights and jump into operational pages from one analytics workspace.</p>
        <div className="inline-actions">
          <button className="btn-primary" onClick={loadAnalytics}>Refresh Analytics</button>
          <Link className="text-link" to="/admin/users">Manage Users</Link>
          <Link className="text-link" to="/admin/bookings">Manage Bookings</Link>
          <Link className="text-link" to="/admin/tickets">Manage Tickets</Link>
          <Link className="text-link" to="/manager/resources">Resource Administration</Link>
        </div>
      </article>

      <div className="card-grid two">
        <RingChartCard title="User Role Distribution" data={userRoleData} emptyMessage="No users to chart." />
        <BarChartCard title="User Account Status" data={toChartData(userStatuses)} color="#0f766e" emptyMessage="No user status data." />
      </div>

      <div className="card-grid two">
        <section className="card">
          <h4>Booking Health</h4>
          <p className="muted">Approval rate: {bookingApprovalRate}%</p>
          <div className="analytics-chart-shell">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData} margin={{ left: 8, right: 8, top: 12, bottom: 4 }}>
                <defs>
                  <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e7490" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0e7490" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e0e4" />
                <XAxis dataKey="month" tick={{ fill: '#4b5f67', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4b5f67', fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#0e7490" fill="url(#bookingsGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <BarChartCard title="Booking Status Breakdown" data={bookingStatusData} color="#0e7490" emptyMessage="No booking data available." />
        </section>
        <section className="card">
          <h4>Ticket Health</h4>
          <p className="muted">Open and in-progress pressure appears in status distribution.</p>
          <div className="analytics-chart-shell">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData} margin={{ left: 8, right: 8, top: 12, bottom: 4 }}>
                <defs>
                  <linearGradient id="ticketsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e0e4" />
                <XAxis dataKey="month" tick={{ fill: '#4b5f67', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4b5f67', fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="tickets" name="Tickets" stroke="#d97706" fill="url(#ticketsGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <BarChartCard title="Ticket Status Breakdown" data={ticketStatusData} color="#d97706" emptyMessage="No ticket status data." />
          <RingChartCard title="Ticket Priority Mix" data={ticketPriorityData} emptyMessage="No ticket priority data." />
        </section>
      </div>

      <div className="card-grid two">
        <BarChartCard title="Resource Type" data={resourceTypeData} color="#4f46e5" emptyMessage="No resource type data." />
        <RingChartCard title="Resource Status" data={resourceStatusData} emptyMessage="No resource status data." />
      </div>
    </div>
  );
}
