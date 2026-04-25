import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import ApprovalDialog from '../components/ApprovalDialog';
import DeleteUserDialog from '../components/DeleteUserDialog';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [dialogUser, setDialogUser] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roleDraft, setRoleDraft] = useState('USER');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
      setError('');
    } catch {
      setError('Admin user endpoint is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users
      .filter((u) => {
        if (tab === 'pending') return u.accountStatus === 'PENDING_APPROVAL';
        if (tab === 'managers') return u.role === 'MANAGER';
        if (tab === 'technicians') return u.role === 'TECHNICIAN';
        return true;
      })
      .filter((u) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
      });
  }, [users, tab, query]);

  const startEditRole = (u) => {
    setEditingId(u.id);
    setRoleDraft(u.role || 'USER');
  };

  const saveRole = async (userId) => {
    try {
      await adminApi.setUserRole(userId, roleDraft);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: roleDraft } : u)));
      setEditingId(null);
      setError('');
    } catch {
      setError('Could not update user role.');
    }
  };

  const promptDeleteUser = (user) => {
    setDeleteCandidate(user);
  };

  const removeUser = async () => {
    if (!deleteCandidate?.id) return;

    setDeleting(true);
    try {
      await adminApi.removeUser(deleteCandidate.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteCandidate.id));
      setDeleteCandidate(null);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete user.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="page-block">Loading users...</div>;

  return (
    <div className="page-block">
      <section className="page-hero">
        <p className="kicker">User Governance</p>
        <h1 className="page-hero-title">User Management</h1>
        <p className="muted">Approve accounts, assign roles, and keep the campus directory healthy.</p>
      </section>

      <div className="inline-actions spread">
        <label className="search-wrap">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" />
        </label>
      </div>

      {error && <p className="muted">{error}</p>}

      <div className="inline-actions tabs">
        <button className={tab === 'all' ? 'tab active' : 'tab'} onClick={() => setTab('all')}>All</button>
        <button className={tab === 'pending' ? 'tab active' : 'tab'} onClick={() => setTab('pending')}>Pending</button>
        <button className={tab === 'managers' ? 'tab active' : 'tab'} onClick={() => setTab('managers')}>Managers</button>
        <button className={tab === 'technicians' ? 'tab active' : 'tab'} onClick={() => setTab('technicians')}>Technicians</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.fullName}</strong>
                  <div className="muted">{u.email}</div>
                </td>
                <td>{u.userType || '-'}</td>
                <td>
                  {editingId === u.id ? (
                    <div className="inline-actions">
                      <select value={roleDraft} onChange={(e) => setRoleDraft(e.target.value)}>
                        <option value="USER">USER</option>
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button className="btn-outline" onClick={() => saveRole(u.id)}>Save</button>
                    </div>
                  ) : (
                    u.role
                  )}
                </td>
                <td>{u.accountStatus}</td>
                <td className="inline-actions">
                  {u.accountStatus === 'PENDING_APPROVAL' ? (
                    <button className="btn-outline" onClick={() => setDialogUser(u)}>Review</button>
                  ) : (
                    <button className="btn-outline" onClick={() => startEditRole(u)}>Edit role</button>
                  )}
                  <button className="btn-danger" onClick={() => promptDeleteUser(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ApprovalDialog
        open={Boolean(dialogUser)}
        candidate={dialogUser}
        onClose={() => setDialogUser(null)}
        onCompleted={loadUsers}
      />

      <DeleteUserDialog
        open={Boolean(deleteCandidate)}
        candidate={deleteCandidate}
        busy={deleting}
        onCancel={() => {
          if (deleting) return;
          setDeleteCandidate(null);
        }}
        onConfirm={removeUser}
      />
    </div>
  );
}
