import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

function item(path, label) {
  return { path, label };
}

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const common = [item('/', 'Home'), item('/profile', 'Profile'), item('/notifications', 'Notifications')];
  const roleSpecific = [];

  if (user?.role === 'USER') {
    roleSpecific.push(item('/dashboard', 'User Dashboard'));
    roleSpecific.push(item('/bookings/my', 'My Bookings'));
    roleSpecific.push(item('/bookings/new', 'New Booking'));
    roleSpecific.push(item('/bookings/calendar', 'Booking Calendar'));
    roleSpecific.push(item('/bookings/heatmap', 'Availability Heatmap'));
    roleSpecific.push(item('/tickets/my', 'My Tickets'));
    roleSpecific.push(item('/tickets/new', 'New Tickets'));

  }
  if (user?.role === 'TECHNICIAN' || user?.role === 'MANAGER' || user?.role === 'ADMIN') {
    roleSpecific.push(item('/technician/dashboard', 'Technician Dashboard'));
  }
  if (user?.role === 'MANAGER' || user?.role === 'ADMIN') {
    roleSpecific.push(item('/manager/dashboard', 'Manager Dashboard'));
  }
  if (user?.role === 'ADMIN') {
    roleSpecific.push(item('/admin', 'Admin Dashboard'));
    roleSpecific.push(item('/admin/users', 'Users Admin'));
    roleSpecific.push(item('/admin/bookings', 'Booking Admin'));
  }

  const items = [...common, ...roleSpecific];

  return (
    <aside className="sidebar">
      <div className="brand">Smart Campus</div>
      <p className="role-chip">{user?.role || 'Guest'}</p>
      <nav>
        {items.map((nav) => (
          <Link
            key={nav.path}
            to={nav.path}
            className={location.pathname === nav.path ? 'nav-link active' : 'nav-link'}
          >
            {nav.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}