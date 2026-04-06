import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { useStore } from '../store/useStore';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useStore((s) => s.login);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await apiClient.post(endpoint, payload);
      login(res.data.token, res.data.user);
      toast.success(`Welcome${res.data.user?.name ? `, ${res.data.user.name}` : ''}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-box">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo-wrap">💳</div>
          <h1 className="login-title gradient-text">SubTrack</h1>
          <p className="login-subtitle">Smart Subscription Management</p>
        </div>

        {/* Card */}
        <div className="login-card">
          {/* Tab switcher */}
          <div className="tab-switcher">
            <button
              type="button"
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input
                  className="field-input"
                  type="text" name="name"
                  value={form.name} onChange={handleChange}
                  placeholder="Alex Johnson" required
                />
              </div>
            )}

            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                className="field-input"
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••" required minLength={6}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary btn-full"
              style={{ marginTop: '8px' }}
            >
              {loading ? <><span className="spinner" />{mode === 'login' ? 'Signing in…' : 'Creating account…'}</> : mode === 'login' ? '→  Sign In' : '→  Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="demo-hint">
              <span>Demo:</span> demo@smartsub.io / demo1234
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
