import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Compass,
  HardDrive,
  Home,
  LayoutDashboard,
  ShieldCheck,
  Ticket,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

function item(path, label, icon) {
  return { path, label, icon };
}

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const common = [
    item('/', 'Home', Home),
    item('/resources', 'Resources', Building2),
    item('/profile', 'Profile', UserRound),
    item('/notifications', 'Notifications', Bell),
  ];

  const roleSpecific = (() => {
    switch (user?.role) {
      case 'USER':
        return [
          item('/dashboard', 'User Dashboard', LayoutDashboard),
          item('/bookings/my', 'My Bookings', CalendarClock),
          item('/bookings/new', 'New Booking', CalendarPlus),
          item('/bookings/calendar', 'Booking Calendar', CalendarDays),
          item('/bookings/heatmap', 'Availability Heatmap', BarChart3),
          item('/tickets/my', 'My Tickets', Ticket),
          item('/tickets/new', 'New Ticket', Ticket),
        ];
      case 'TECHNICIAN':
        return [
          item('/technician/dashboard', 'Technician Dashboard', Wrench),
        ];
      case 'MANAGER':
        return [
          item('/technician/dashboard', 'Technician Dashboard', Wrench),
          item('/manager/dashboard', 'Manager Dashboard', Compass),
          item('/manager/resources', 'Manage Resources', HardDrive),
        ];
      case 'ADMIN':
        return [
          item('/admin', 'Admin Dashboard', ShieldCheck),
          item('/admin/users', 'Manage Users', Users),
          item('/admin/bookings', 'Manage Bookings', CalendarClock),
          item('/admin/tickets', 'Manage Tickets', Ticket),
          item('/manager/resources', 'Manage Resources', HardDrive),
        ];
      default:
        return [];
    }
  })();

  const items = [...common, ...roleSpecific];

  return (
    <aside className="sidebar">
      <section className="sidebar-head">
        <div className="brand-wrap">
          <div className="brand-mark">
            <Building2 size={18} />
          </div>
          <div>
            <p className="brand">Smart Campus</p>
            <p className="sidebar-sub">Operations Hub</p>
          </div>
        </div>
        <p className="sidebar-role">{user?.role || 'Guest'}</p>
      </section>

      <nav className="sidebar-nav">
        {items.map((nav) => {
          const isActive =
            nav.path === '/'
              ? location.pathname === '/'
              : location.pathname === nav.path || location.pathname.startsWith(`${nav.path}/`);

          const Icon = nav.icon;

          return (
            <Link
              key={nav.path}
              to={nav.path}
              className={isActive ? 'nav-link active' : 'nav-link'}
            >
              {Icon && (
                <span className="nav-icon">
                  <Icon size={16} strokeWidth={2.2} />
                </span>
              )}
              <span className="nav-link-label">{nav.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        Smart alerts, bookings, and resource control from one workspace.
      </div>
    </aside>
  );
}