import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/subscriptions', icon: '💳', label: 'Subscriptions' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Navbar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <div className="flex gap-8" style={{ alignItems: 'center' }}>
          <div style={{ width:30, height:30, background:'var(--grad-primary)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💳</div>
          <span style={{ fontWeight:700, fontSize:16 }} className="gradient-text">SubTrack</span>
        </div>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle nav">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Overlay */}
      <div className={`mobile-overlay ${open ? 'open' : ''}`} onClick={close} />

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💳</div>
          <div>
            <div className="sidebar-logo-text gradient-text">SubTrack</div>
            <div className="sidebar-logo-sub">Subscription Manager</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={close}
            >
              <span className="nav-link-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
            <div className="truncate">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-danger btn-full btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
