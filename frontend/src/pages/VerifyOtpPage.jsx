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
    <div className="otp-page-bg">
      <div className="otp-card">
        <div className="otp-icon-circle">🔐</div>
        <h1>Two-Step Verification</h1>
        <p>
          We sent a 6-digit code to your registered email.<br />
          Enter it below to continue.
        </p>

        <form className="otp-form" onSubmit={handleVerify}>
          <input
            id="otp-code"
            className="otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            required
            autoComplete="one-time-code"
          />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtpPage;
