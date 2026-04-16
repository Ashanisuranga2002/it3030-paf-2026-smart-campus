import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

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
      setSuccess('Account created successfully. Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const isNetworkError = err?.code === 'ERR_NETWORK' || !err?.response;
      const message = isNetworkError
        ? 'Cannot reach backend API. Make sure the backend is running and API URL is correct.'
        : err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.errors?.email ||
          err?.response?.data?.errors?.password ||
          'Failed to create account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h1>Create Account</h1>
        <p>Use a valid email. You will use this account to sign in and verify OTP.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="text-input"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="text-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="text-input"
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <input
            className="text-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />

          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="helper-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
