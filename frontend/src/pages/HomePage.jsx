import { useAuth } from '../features/auth/AuthContext';

function Card({ title, body }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page-block">
      <h1>Welcome, {user?.fullName}</h1>
      <p className="muted">Role: {user?.role} | Status: {user?.accountStatus || 'ACTIVE'}</p>
      <div className="card-grid four">
        <Card title="Resources" body="View and request campus equipment and spaces." />
        <Card title="Bookings" body="Track booking slots and availability." />
        <Card title="Tickets" body="Submit and monitor support requests." />
        <Card title="Announcements" body="Stay updated on notices and events." />
      </div>
    </div>
  );
}
