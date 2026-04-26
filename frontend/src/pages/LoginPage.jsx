import { useState } from 'react';
import { ArrowRight, Building2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const onLogin = () => {
    setSubmitting(true);
    loginWithGoogle();
  };

  return (
    <div className="login-page login-page-immersive">
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      <section className="login-copy">
        <p className="kicker">Smart Campus Platform</p>
        <h1>Run bookings, incidents, and teams from one smart control room.</h1>
        <p>
          A single workspace for users, technicians, managers, and admins to coordinate faster and stay in sync.
        </p>

        <div className="login-highlights">
          <div className="login-highlight">
            <ShieldCheck size={18} />
            <span>Role-aware secure access</span>
          </div>
          <div className="login-highlight">
            <Zap size={18} />
            <span>Live booking and alerts</span>
          </div>
          <div className="login-highlight">
            <Building2 size={18} />
            <span>Unified campus operations</span>
          </div>
        </div>

        <div className="login-stats-grid">
          <article className="login-stat-card">
            <p className="login-stat-value">4 Roles</p>
            <p className="login-stat-label">One connected workflow</p>
          </article>
          <article className="login-stat-card">
            <p className="login-stat-value">Live Alerts</p>
            <p className="login-stat-label">Role and ticket updates</p>
          </article>
          <article className="login-stat-card">
            <p className="login-stat-value">Fast Booking</p>
            <p className="login-stat-label">Smart slot suggestions</p>
          </article>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-badge">
          <Building2 size={14} />
          Operations Hub
        </div>
        <h2>Sign in</h2>
        <p>Use your institutional Google account to continue.</p>

        <div className="login-quick-points">
          <span>Secure OAuth login</span>
          <span>Role-based dashboards</span>
          <span>Notification center</span>
        </div>

        <button className="btn-primary btn-wide" onClick={onLogin} disabled={submitting}>
          <Sparkles size={16} />
          {submitting ? 'Redirecting...' : 'Sign in with Google'}
          {!submitting && <ArrowRight size={16} />}
        </button>
      </section>
    </div>
  );
}
