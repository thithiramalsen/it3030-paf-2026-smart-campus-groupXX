import { useAuth } from '../features/auth/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function ShellLayout({ children }) {
  const { user } = useAuth();

  if (!user) return children;

  return (
    <div className="app-shell">
      <Sidebar />
      <section className="content-shell">
        <Topbar />
        <main className="content-area">{children}</main>
      </section>
    </div>
  );
}
