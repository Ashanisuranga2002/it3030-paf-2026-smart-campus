import axiosInstance from '../api/axiosInstance';

export const getResources = async (filters = {}) => {
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

  const response = await axiosInstance.get('/api/resources', { params });
  return response.data;
};
