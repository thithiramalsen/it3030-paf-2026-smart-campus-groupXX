import { useEffect, useState } from 'react';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../features/auth/AuthContext';

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', profileImageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    let alive = true;

    profileApi
      .getMine()
      .then((res) => {
        if (!alive) return;
        const p = {
          ...(res.data || {}),
          profileImageUrl:
            res.data?.profileImageUrl || res.data?.picture || res.data?.avatarUrl || res.data?.imageUrl || '',
        };
        setProfile(p);
        setForm({
          fullName: p.fullName || '',
          profileImageUrl: p.profileImageUrl,
        });
      })
      .catch(() => {
        if (!alive) return;
        setError('Profile endpoint is unavailable right now.');
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileApi.updateMine(form);
      setProfile({
        ...(res.data || {}),
        profileImageUrl:
          res.data?.profileImageUrl || res.data?.picture || res.data?.avatarUrl || res.data?.imageUrl || '',
      });
      await refreshUser();
      setAvatarBroken(false);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.fullName || profile?.name || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  if (loading) return <div className="page-block">Loading profile...</div>;

  return (
    <div className="page-block narrow">
      <h1>Profile</h1>
      {error && <p className="muted">{error}</p>}

      {!editing && profile && (
        <section className="card profile-card">
          <h3>{profile.fullName}</h3>
          <p>{profile.email}</p>
          <p className="muted">Role: {profile.role} | Status: {profile.accountStatus}</p>
          {profile.profileImageUrl && !avatarBroken ? (
            <img
              className="avatar"
              src={profile.profileImageUrl}
              alt={displayName}
              onError={() => setAvatarBroken(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="avatar avatar-fallback">{initials}</div>
          )}
          <button className="btn-primary" onClick={() => setEditing(true)}>Edit profile</button>
        </section>
      )}

      {editing && (
        <form className="card form-grid" onSubmit={onSave}>
          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={onChange} required />
          </label>
          <label>
            Profile image URL
            <input name="profileImageUrl" value={form.profileImageUrl} onChange={onChange} />
          </label>
          <div className="inline-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn-outline" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
