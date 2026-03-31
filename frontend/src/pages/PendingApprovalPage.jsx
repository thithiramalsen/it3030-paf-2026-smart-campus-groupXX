import { useAuth } from '../features/auth/AuthContext';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="center-screen">
      <article className="pending-card">
        <h1>Account Pending Approval</h1>
        <p>
          Hello {user?.fullName || user?.email}, your account is awaiting administrator approval.
        </p>
        <button className="btn-outline" onClick={logout}>Logout</button>
      </article>
    </div>
  );
}
