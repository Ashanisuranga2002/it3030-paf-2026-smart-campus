import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithEmailPassword } from '../services/authService';
import LoginButton from '../components/auth/LoginButton';

const features = [
  { icon: '🏢', text: 'Access campus resources & facility details' },
  { icon: '📅', text: 'Book facilities with smart approval workflow' },
  { icon: '🎫', text: 'Report and track maintenance tickets' },
];

function LoginPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginWithEmailPassword(email, password);
      await loginWithToken(data.token);
      navigate('/resources');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left branded panel */}
      <div className="auth-page-panel">
        <div className="auth-panel-logo">
          <div className="auth-panel-logo-icon">🎓</div>
          <h1>Smart Campus</h1>
          <p>Your campus operations hub</p>
        </div>
        <div className="auth-panel-features">
          {features.map(f => (
            <div key={f.text} className="auth-panel-feature">
              <span className="auth-panel-feature-icon">{f.icon}</span>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-page-form">
        <div className="auth-form-box fade-in">
          <p className="auth-form-kicker">Welcome Back</p>
          <h2>Sign in to your account</h2>
          <p>Enter your credentials to access the dashboard.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="sc-input-group">
              <label className="sc-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                className="text-input"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="sc-input-group">
              <label className="sc-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="text-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button
              id="login-submit"
              className="btn btn-primary auth-form-submit"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--c-muted)', fontSize: '.83rem' }}>or</p>
          <LoginButton />

          <p className="auth-form-footer">
            Don&apos;t have an account? <Link to="/register">Create one for free</Link>
          </p>
          <p className="auth-form-footer" style={{ marginTop: '.4rem' }}>
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
