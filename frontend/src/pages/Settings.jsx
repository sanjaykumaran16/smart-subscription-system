import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CHF'];

export default function Settings() {
  const { user, setUser, logout } = useStore();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      setUser({ ...user, currency });
      toast.success('Preferences saved!');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="page-enter" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div className="card mb-16">
        <div className="settings-section-title">Profile</div>
        <div className="profile-row">
          <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card mb-16">
        <div className="settings-section-title">Preferences</div>
        <div className="field-group">
          <label className="field-label">Display Currency</label>
          <select
            className="field-input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="field-hint">Sets your preferred display currency for analytics.</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner" />Saving…</> : 'Save Preferences'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="card card-danger">
        <div className="settings-section-title text-danger">Account</div>
        <div className="danger-row">
          <div>
            <div style={{ fontWeight: 600 }}>Sign Out</div>
            <div className="danger-desc">You'll need to log in again to access your data</div>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:12, marginTop:24 }}>
        SubTrack v1.0.0 — Smart Subscription Management System
      </div>
    </div>
  );
}
