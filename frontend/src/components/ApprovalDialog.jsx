import { useState } from 'react';
import { adminApi } from '../api/adminApi';

export default function ApprovalDialog({ open, candidate, onClose, onCompleted }) {
  const [role, setRole] = useState('USER');
  const [busy, setBusy] = useState(false);

  if (!open || !candidate) return null;

  const close = () => {
    if (busy) return;
    onClose();
    setRole('USER');
  };

  const approve = async () => {
    setBusy(true);
    try {
      await adminApi.setUserStatus(candidate.id, 'ACTIVE');
      await adminApi.setUserRole(candidate.id, role);
      onCompleted();
      close();
    } finally {
      setBusy(false);
    }
  };

  const deny = async () => {
    setBusy(true);
    try {
      await adminApi.setUserStatus(candidate.id, 'SUSPENDED');
      onCompleted();
      close();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h3>Review account request</h3>
        <p><strong>{candidate.fullName}</strong> - {candidate.email}</p>
        <label>
          Assign role
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={busy}>
            <option value="USER">USER</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="MANAGER">MANAGER</option>
          </select>
        </label>
        <div className="dialog-actions">
          <button className="btn-primary" onClick={approve} disabled={busy}>Approve</button>
          <button className="btn-danger" onClick={deny} disabled={busy}>Deny</button>
          <button className="btn-outline" onClick={close} disabled={busy}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
