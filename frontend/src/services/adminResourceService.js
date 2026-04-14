import axiosInstance from '../api/axiosInstance';

export const getAdminResources = async (filters = {}) => {
  const params = {};

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.type && filters.type !== 'ALL') {
    params.type = filters.type;
  }
  if (filters.status && filters.status !== 'ALL') {
    params.status = filters.status;
  }

  const response = await axiosInstance.get('/api/admin/resources', { params });
  return response.data;
};

export const createResource = async (payload) => {
  const response = await axiosInstance.post('/api/admin/resources', payload);
  return response.data;
};

export const updateResource = async (id, payload) => {
  const response = await axiosInstance.put(`/api/admin/resources/${id}`, payload);
  return response.data;
};

export const deleteResource = async (id) => {
  await axiosInstance.delete(`/api/admin/resources/${id}`);
};
