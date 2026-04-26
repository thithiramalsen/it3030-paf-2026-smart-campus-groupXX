import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';

const features = [
  { icon: '📅', label: 'Smart Bookings', desc: 'AI-powered slot suggestions' },
  { icon: '🔔', label: 'Live Alerts', desc: 'Real-time notifications' },
  { icon: '🎫', label: 'Incident Tickets', desc: 'Track and resolve issues' },
  { icon: '📊', label: 'Analytics', desc: 'Data-driven insights' },
];

const stats = [
  { value: '4', label: 'Role Types' },
  { value: '∞', label: 'Resources' },
  { value: '24/7', label: 'Availability' },
];

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const onLogin = () => {
    setSubmitting(true);
    loginWithGoogle();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#020817',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-30px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .feature-card:hover {
          background: rgba(99,102,241,0.12) !important;
          border-color: rgba(99,102,241,0.4) !important;
          transform: translateY(-2px);
        }
        .google-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(99,102,241,0.5) !important;
        }
        .google-btn:active:not(:disabled) { transform: translateY(0); }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; padding: 24px !important; }
        }
      `}</style>

      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '30%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)',
          animation: 'float1 12s ease-in-out infinite reverse',
        }} />
      </div>

      {/* LEFT SIDE */}
      <div className="login-left" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 64px',
        position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateX(-20px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>🏛️</div>
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1,
            }}>Smart Campus</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Operations Hub
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 24,
            fontSize: 12, color: '#818cf8', fontWeight: 500,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#4ade80', display: 'inline-block',
              boxShadow: '0 0 6px #4ade80',
              animation: 'pulse 2s infinite',
            }} />
            Now live — 2026 Semester 1
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(36px, 4vw, 56px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.1, margin: '0 0 20px',
            letterSpacing: '-1px',
          }}>
            Run your campus<br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 50%, #f472b6 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s ease infinite',
            }}>from one place.</span>
          </h1>

          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7, maxWidth: 480, margin: 0, fontWeight: 400,
          }}>
            Bookings, incident reports, team coordination, and analytics —
            unified for students, technicians, managers, and admins.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, marginBottom: 48, maxWidth: 520,
        }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'default', transition: 'all 0.2s',
              animation: `fadeUp 0.6s ${0.1 + i * 0.1}s both`,
            }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40 }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28, fontWeight: 700,
                color: '#fff', lineHeight: 1,
              }}>{s.value}</div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,0.35)',
                marginTop: 4,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE — Login Card */}
      <div className="login-right" style={{
        width: '440px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateX(20px)',
        transition: 'all 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '40px 36px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>

          {/* Card header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.2))',
              border: '1px solid rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 28,
              boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
            }}>🔐</div>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 26, fontWeight: 700, color: '#fff',
              margin: '0 0 8px', letterSpacing: '-0.5px',
            }}>Welcome back</h2>
            <p style={{
              fontSize: 14, color: 'rgba(255,255,255,0.45)',
              margin: 0, lineHeight: 1.6,
            }}>
              Sign in with your institutional<br />Google account to continue
            </p>
          </div>

          {/* Features checklist */}
          <div style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 12, padding: '16px',
            marginBottom: 28,
          }}>
            {[
              'Secure OAuth 2.0 login',
              'Role-based access control',
              'Real-time notifications',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                paddingTop: i > 0 ? 10 : 0,
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                marginTop: i > 0 ? 10 : 0,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(74,222,128,0.15)',
                  border: '1px solid rgba(74,222,128,0.4)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#4ade80',
                  }} />
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Google button */}
          <button
            className="google-btn"
            onClick={onLogin}
            disabled={submitting}
            style={{
              width: '100%', padding: '15px 20px',
              background: submitting
                ? 'rgba(99,102,241,0.4)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none', borderRadius: 12,
              cursor: submitting ? 'not-allowed' : 'pointer',
              color: '#fff', fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: submitting ? 'none' : '0 8px 32px rgba(99,102,241,0.35)',
              letterSpacing: '0.2px',
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Redirecting to Google...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.8)"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.6)"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.7)"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <p style={{
            textAlign: 'center', fontSize: 12,
            color: 'rgba(255,255,255,0.2)',
            margin: '20px 0 0', lineHeight: 1.6,
          }}>
            By signing in you agree to the university's<br />
            terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}