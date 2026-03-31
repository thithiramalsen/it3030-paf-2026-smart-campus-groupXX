import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import PendingApprovalPage from '../pages/PendingApprovalPage';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-screen">Loading your session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.accountStatus === 'PENDING_APPROVAL') {
    return <PendingApprovalPage />;
  }

  return children;
}
