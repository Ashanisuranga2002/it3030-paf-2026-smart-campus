import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const challenge = searchParams.get('challenge');

    const completeLogin = async () => {
      if (challenge) {
        navigate(`/verify-otp?challenge=${encodeURIComponent(challenge)}`, { replace: true });
        return;
      }

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        await loginWithToken(token);
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth success handling failed', error);
        navigate('/login');
      }
    };

    completeLogin();
  }, [searchParams, loginWithToken, navigate]);

  return <div className="center-screen">Completing login...</div>;
}

export default OAuthSuccessPage;

