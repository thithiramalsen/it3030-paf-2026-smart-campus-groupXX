import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteUserDialog({ open, candidate, busy, onCancel, onConfirm }) {
  if (!open || !candidate) return null;

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
      <div className="dialog-card danger-dialog">
        <div className="danger-dialog-head">
          <span className="danger-dialog-icon" aria-hidden="true">
            <AlertTriangle size={18} />
          </span>
          <h3 id="delete-user-title">Delete user account?</h3>
        </div>

        <p className="danger-dialog-text">
          You are about to permanently remove <strong>{candidate.fullName || 'this user'}</strong>.
          This action cannot be undone.
        </p>

        <div className="danger-dialog-meta">
          <span>{candidate.email}</span>
          <span>{candidate.role} | {candidate.accountStatus}</span>
        </div>

        <div className="dialog-actions">
          <button className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={busy}>
            <Trash2 size={15} />
            {busy ? 'Deleting...' : 'Delete user'}
          </button>
        </div>
      </div>
    </div>
  );
}
