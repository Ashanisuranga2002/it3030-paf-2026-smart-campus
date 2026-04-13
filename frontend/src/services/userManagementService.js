import axiosInstance from '../api/axiosInstance';

export const getAllUsers = async () => {
  const response = await axiosInstance.get('/api/admin/users');
  return response.data;
};

export const createUser = async (payload) => {
  const response = await axiosInstance.post('/api/admin/users', payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await axiosInstance.put(`/api/admin/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  await axiosInstance.delete(`/api/admin/users/${id}`);
};
