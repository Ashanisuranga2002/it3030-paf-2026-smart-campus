import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginButton from '../components/auth/LoginButton';
import { useAuth } from '../context/AuthContext';
import { loginWithEmailPassword } from '../services/authService';

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
    <div className="center-screen">
      <div className="card auth-card">
        <h1>Smart Campus</h1>
        <p>Sign in with your email and password.</p>

        <form className="login-form" onSubmit={handleSubmit}>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="helper-text">
          New user? <Link to="/register">Create account</Link>
        </p>

        <p className="or-separator">or</p>
        <LoginButton />
      </div>
    </div>
  );
}

export default LoginPage;
