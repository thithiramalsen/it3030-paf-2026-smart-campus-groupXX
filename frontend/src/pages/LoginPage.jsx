import { useState } from 'react';
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
      </section>
      <section className="login-card">
        <h2>Sign in</h2>
        <p>Use your institutional Google account to continue.</p>
        <button className="btn-primary" onClick={onLogin} disabled={submitting}>
          {submitting ? 'Redirecting...' : 'Sign in with Google'}
        </button>
      </section>
    </div>
  );
}
