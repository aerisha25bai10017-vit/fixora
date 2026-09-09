import React, { useState, useContext } from 'react';
import API from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const BLOCKS = ['Health', 'Maintenance', 'Academic', 'Personal'];

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleSceneMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -22, y: px * 26 });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setError('');
    // Super Admin is login-only — there's exactly one, seeded on the server.
    if (nextRole === 'superadmin') {
      setIsRegister(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && role === 'admin' && !formData.department) {
      setError('Please select the block you\'ll be managing.');
      return;
    }

    setLoading(true);
    const endpoint = isRegister ? '/register' : '/login';
    const payload = isRegister
      ? {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          ...(role === 'admin' ? { department: formData.department } : {}),
        }
      : { email: formData.email, password: formData.password };

    try {
      const res = await API.post(endpoint, payload);
      // Backend returns access_token + user{role, name} on login; registration may also auto-return a token.
      if (res.data.access_token) {
        const returnedRole = res.data.user?.role || res.data.role;
        if (!isRegister && role !== returnedRole) {
          const friendly = { student: 'Student', admin: 'Admin', superadmin: 'Super Admin' };
          setError(`This account is a ${friendly[returnedRole] || returnedRole} account. Switch tabs to sign in.`);
          setLoading(false);
          return;
        }
        login(res.data);
      } else {
        // Registered but not logged in yet -> switch to login form.
        setIsRegister(false);
        setError('Account created — please sign in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const heroCopy = {
    student: <>Raise it once, track it live. From a leaky pipe in the hostel to a
      flickering lab light — report it, watch staff get assigned, and
      never let an issue go quiet again.</>,
    admin: 'Your desk for one block — pick up assigned grievances, update their status, and keep your queue moving.',
    superadmin: 'Command center for every block — Health, Maintenance, Academic, and Personal. Review every query raised and route it to the right admin.',
  };

  const heroTitleIcon = role === 'superadmin' ? '👑' : role === 'admin' ? '🛠️' : '🔧';

  return (
    <div className="auth-shell fade-in">
      <div className={`auth-hero ${role === 'admin' ? 'auth-hero-admin' : ''} ${role === 'superadmin' ? 'auth-hero-superadmin' : ''}`}>
        <span className="eyebrow">welcome to</span>
        <h1>FIXora</h1>
        <p>{heroCopy[role]}</p>
        <div
          className="hero-3d-scene"
          onMouseMove={handleSceneMove}
          onMouseLeave={resetTilt}
        >
          <div className="hero-3d-glow" />
          <div className="hero-3d-ring" />
          <div
            className="hero-3d-orbit"
            style={{ transform: `rotateX(${8 + tilt.x}deg) rotateY(${-10 + tilt.y}deg)` }}
          >
            <div className="hero-3d-stage">
              <div className="hero-3d-card card-back">
                <span className="c3d-badge badge-teal"><span className="c3d-icon">🏥</span></span>
                <span className="c3d-label">Health</span>
              </div>
              <div className="hero-3d-card card-mid">
                <span className="c3d-badge badge-coral"><span className="c3d-icon">📚</span></span>
                <span className="c3d-label">Academic</span>
              </div>
              <div className="hero-3d-card card-front">
                <span className="c3d-badge badge-marigold">
                  <span className="c3d-icon">{heroTitleIcon}</span>
                </span>
                <span className="c3d-label">
                  {role === 'superadmin' ? 'Assign to Admin' : role === 'admin' ? 'Resolve & Update' : 'Raise & Track'}
                </span>
                <span className="c3d-shine" />
              </div>
              <div className="hero-3d-orb orb-a" />
              <div className="hero-3d-orb orb-b" />
              <div className="hero-3d-orb orb-c" />
              <div className="hero-3d-orb orb-d" />
            </div>
          </div>
        </div>
        <div className="hero-notes">
          {role === 'superadmin' ? (
            <>
              <div className="floating-note" style={{ '--r': '-6deg' }}>🏥 Health block — 3 open</div>
              <div className="floating-note" style={{ '--r': '4deg' }}>🧰 Maintenance — 2 admins</div>
              <div className="floating-note" style={{ '--r': '-3deg' }}>✅ Query assigned to admin</div>
            </>
          ) : role === 'admin' ? (
            <>
              <div className="floating-note" style={{ '--r': '-6deg' }}>📊 42 issues resolved this week</div>
              <div className="floating-note" style={{ '--r': '4deg' }}>🧰 Assigned to you by Super Admin</div>
              <div className="floating-note" style={{ '--r': '-3deg' }}>⚡ Live SLA breach alerts</div>
            </>
          ) : (
            <>
              <div className="floating-note" style={{ '--r': '-6deg' }}>🔧 Hostel tap fixed in 4h</div>
              <div className="floating-note" style={{ '--r': '4deg' }}>💡 Lab light — In Progress</div>
              <div className="floating-note" style={{ '--r': '-3deg' }}>⚠️ Escalated: no response 24h</div>
            </>
          )}
        </div>
      </div>

      <div className="auth-panel">
        <button
          className="theme-toggle auth-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          type="button"
        />
        <div className="auth-card">
          <div className="pin" />
          <h2>
            {isRegister
              ? 'Create your account'
              : role === 'admin'
              ? 'Admin sign in'
              : role === 'superadmin'
              ? 'Super Admin sign in'
              : 'Welcome back'}
          </h2>
          <p className="sub">
            {isRegister
              ? 'Join your campus grievance desk'
              : role === 'admin'
              ? 'Access your block queue and resolve grievances'
              : role === 'superadmin'
              ? 'Oversee every block and assign queries to admins'
              : 'Sign in to track your grievances'}
          </p>

          <div className="role-toggle role-toggle-3">
            <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => selectRole('student')}>
              🎓 Student
            </button>
            <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => selectRole('admin')}>
              🛠️ Admin
            </button>
            <button type="button" className={role === 'superadmin' ? 'active' : ''} onClick={() => selectRole('superadmin')}>
              👑 Super Admin
            </button>
          </div>

          {role === 'superadmin' && (
            <p className="superadmin-note">
              Super Admin access is provisioned by the system — this account can't be self-registered.
            </p>
          )}

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            {isRegister && (
              <div className="input-group">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="input-group">
              <label>College email</label>
              <input
                type="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            {isRegister && role === 'admin' && (
              <div className="input-group">
                <label>Block you'll manage</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a block...</option>
                  {BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <span className="field-hint">Queries raised for this block will be routed to you by the Super Admin.</span>
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Please wait...' : isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {role !== 'superadmin' && (
            <div className="auth-switch">
              {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
              <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                {isRegister ? 'Log in' : 'Register'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
