import { useState } from 'react';
import { Building2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const onLogin = () => {
    setSubmitting(true);
    loginWithGoogle();
  };

  return (
    <div className="login-page">
      <section className="login-copy">
        <p className="kicker">Smart Campus Platform</p>
        <h1>Operate the campus from one control room.</h1>
        <p>
          Book resources, track service requests, coordinate teams, and keep everyone informed.
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
      </section>

      <section className="login-card">
        <div className="login-card-badge">
          <Building2 size={14} />
          Operations Hub
        </div>
        <h2>Sign in</h2>
        <p>Use your institutional Google account to continue.</p>

        <button className="btn-primary btn-wide" onClick={onLogin} disabled={submitting}>
          <Sparkles size={16} />
          {submitting ? 'Redirecting...' : 'Sign in with Google'}
        </button>
      </section>
    </div>
  );
}
