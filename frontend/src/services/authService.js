import axiosInstance from '../api/axiosInstance';

export const getLoginUrl = async () => {
  const response = await axiosInstance.get('/api/auth/login-url');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/api/auth/me');
  return response.data;
};

export const updateCurrentUser = async (payload) => {
  const response = await axiosInstance.put('/api/auth/me', payload);
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await axiosInstance.post('/api/auth/register', {
    name,
    email,
    password
  });
  return response.data;
};

export const loginWithEmailPassword = async (email, password) => {
  const response = await axiosInstance.post('/api/auth/login/password', {
    email,
    password
  });
  return response.data;
};

export const verifyTwoFactor = async (challengeId, code) => {
  const response = await axiosInstance.post('/api/auth/2fa/verify', {
    challengeId,
    code
  });
  return response.data;
};
