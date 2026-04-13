import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

const CAMPUS_IMAGE = 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1200&auto=format&fit=crop&q=80';

const perks = [
  { icon: '⚡', text: 'Instant access to all campus digital services' },
  { icon: '🔐', text: 'Two-factor authentication for enhanced security' },
  { icon: '📅', text: 'Book facilities, join clubs & track events' },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, email, password);
      setSuccess('Account created! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email ||
        err?.response?.data?.errors?.password ||
        'Failed to create account';
      setError(message);
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
          alt="University campus building"
          className="auth-panel-image__bg"
        />
        <div className="auth-panel-image__overlay" />
        <div className="auth-panel-image__orbs">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>
        <div className="auth-panel-image__content">
          <div className="auth-panel-image__badge">
            <span /> Join Smart Campus
          </div>
          <h2 className="auth-panel-image__title">
            Start Your<br /><span>Digital Journey</span>
          </h2>
          <p className="auth-panel-image__subtitle">
            Create your account and unlock seamless access to everything your campus has to offer — from day one.
          </p>
          <div className="auth-panel-image__features">
            {perks.map((p) => (
              <div key={p.text} className="auth-feature-chip">
                <span className="auth-feature-chip__icon">{p.icon}</span>
                <span className="auth-feature-chip__text">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <div className="auth-logo-mark">🎓</div>
          <h1>Create account</h1>
          <p>Fill in your details below — it only takes a minute.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="fullname">Full name</label>
              <input
                id="fullname"
                className="text-input"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                className="text-input"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>

            {error ? <p className="error-text">{error}</p> : null}
            {success ? <p className="success-text">{success}</p> : null}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="helper-text" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
