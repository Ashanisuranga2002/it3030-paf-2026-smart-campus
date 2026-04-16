import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyTwoFactor } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const challenge = searchParams.get('challenge');

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!challenge) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await verifyTwoFactor(challenge, code);
      await loginWithToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h1>Two-Step Verification</h1>
        <p>Enter the 6-digit verification code.</p>

        <form className="otp-form" onSubmit={handleVerify}>
          <input
            className="otp-input"
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            required
          />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtpPage;
