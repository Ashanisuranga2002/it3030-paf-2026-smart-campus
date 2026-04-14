import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginButton from '../components/auth/LoginButton';
import { useAuth } from '../context/AuthContext';
import { loginWithEmailPassword } from '../services/authService';

const CAMPUS_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80';

const features = [
  { icon: '🏫', text: 'Access campus resources and facility details' },
  { icon: '🎓', text: 'Manage club memberships & student activities' },
  { icon: '🔔', text: 'Real-time notifications & event alerts' },
];

function LoginPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginWithEmailPassword(email, password);
      await loginWithToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* ── Left: Hero Image Panel ── */}
      <div className="auth-panel-image">
        <img
          src={CAMPUS_IMAGE}
          alt="University campus"
          className="auth-panel-image__bg"
        />
        <div className="auth-panel-image__overlay" />
        <div className="auth-panel-image__orbs">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>
        <div className="auth-panel-image__content">
          <div className="auth-panel-image__badge">
            <span /> Smart Campus Platform
          </div>
          <h2 className="auth-panel-image__title">
            Your Campus,<br /><span>Reimagined</span>
          </h2>
          <p className="auth-panel-image__subtitle">
            A unified digital hub for students, staff, and administrators — connecting every corner of your institution.
          </p>
          <div className="auth-panel-image__features">
            {features.map((f) => (
              <div key={f.text} className="auth-feature-chip">
                <span className="auth-feature-chip__icon">{f.icon}</span>
                <span className="auth-feature-chip__text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <div className="auth-logo-mark">🏛️</div>
          <h1>Welcome back</h1>
          <p>Sign in to your Smart Campus account to continue.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email address</label>
              <input
                id="email"
                className="text-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="text-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error ? <p className="error-text">{error}</p> : null}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="or-separator" style={{ margin: '20px 0' }}>or</div>

          <LoginButton />

          <p className="helper-text">
            New to Smart Campus? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
