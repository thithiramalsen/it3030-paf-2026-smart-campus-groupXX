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
  MessageSquare,
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

  const roleSpecific = [];

  if (user?.role === 'USER') {
    roleSpecific.push(item('/dashboard', 'User Dashboard', LayoutDashboard));
    roleSpecific.push(item('/bookings/my', 'My Bookings', CalendarClock));
    roleSpecific.push(item('/bookings/new', 'New Booking', CalendarPlus));
    roleSpecific.push(item('/bookings/calendar', 'Booking Calendar', CalendarDays));
    roleSpecific.push(item('/bookings/heatmap', 'Availability Heatmap', BarChart3));
    roleSpecific.push(item('/tickets/my', 'My Tickets', Ticket));
    roleSpecific.push(item('/tickets/new', 'New Ticket', Ticket));
  }

  if (user?.role === 'TECHNICIAN' || user?.role === 'MANAGER' || user?.role === 'ADMIN') {
    roleSpecific.push(item('/technician/dashboard', 'Technician Dashboard', Wrench));
  }

  if (user?.role === 'MANAGER' || user?.role === 'ADMIN') {
    roleSpecific.push(item('/manager/dashboard', 'Manager Dashboard', Compass));
    roleSpecific.push(item('/manager/resources', 'Manage Resources', HardDrive));
  }

  if (user?.role === 'ADMIN') {
    roleSpecific.push(item('/admin', 'Admin Dashboard', ShieldCheck));
    roleSpecific.push(item('/admin/users', 'Users Admin', Users));
    roleSpecific.push(item('/admin/bookings', 'Booking Admin', CalendarClock));
     roleSpecific.push(item('/bookings/heatmap', 'Availability Heatmap',BarChart3));
    roleSpecific.push(item('/admin/tickets', 'Ticket Management', Ticket));
    roleSpecific.push(item('/admin/tickets/reply', 'Reply Tickets', MessageSquare));

  }

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
            location.pathname === nav.path ||
            (nav.path === '/resources' && location.pathname.startsWith('/resources/')) ||
            (nav.path === '/manager/resources' && location.pathname.startsWith('/manager/resources/'));

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