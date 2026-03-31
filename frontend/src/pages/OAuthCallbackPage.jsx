import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../auth/tokenStore';
import { useAuth } from '../features/auth/AuthContext';

function parseHashParams(hash) {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(value);
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const params = parseHashParams(window.location.hash || '');
    const accessToken = params.get('accessToken') || '';
    const refreshToken = params.get('refreshToken') || '';

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true });
      return;
    }

    setTokens(accessToken, refreshToken);

    refreshUser()
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate, refreshUser]);

  return (
    <div className="page page-center">
      <div className="card">
        <h2>Signing you in...</h2>
        <p>Please wait while we complete your Google sign-in.</p>
      </div>
    </div>
  );
}
