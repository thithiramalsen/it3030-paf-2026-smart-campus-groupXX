
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-block">
      <h1>Welcome, {user?.fullName}</h1>
      <p className="muted">Role: {user?.role} | Status: {user?.accountStatus || 'ACTIVE'}</p>
      <div className="card-grid four">

        <article
          className="card"
          onClick={() => navigate('/resources')}
          style={{ cursor: 'pointer' }}
        >
          <h3>Resources</h3>
          <p>View and request campus equipment and spaces.</p>
        </article>

        <article className="card" style={{ cursor: 'pointer' }}>
          <h3>Bookings</h3>
          <p>Track booking slots and availability.</p>
        </article>

        <article className="card" style={{ cursor: 'pointer' }}>
          <h3>Tickets</h3>
          <p>Submit and monitor support requests.</p>
        </article>

        <article className="card" style={{ cursor: 'pointer' }}>
          <h3>Announcements</h3>
          <p>Stay updated on notices and events.</p>
        </article>

      </div>
    </div>
  );
}