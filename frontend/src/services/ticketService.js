import axiosInstance from '../api/axiosInstance';

export const getTickets = async () => {
  const response = await axiosInstance.get('/api/tickets');
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await axiosInstance.get(`/api/tickets/${id}`);
  return response.data;
};

export const createTicket = async (payload) => {
  const response = await axiosInstance.post('/api/tickets', payload);
  return response.data;
};

export const updateTicket = async (id, payload) => {
  const response = await axiosInstance.put(`/api/tickets/${id}`, payload);
  return response.data;
};

export const deleteTicket = async (id) => {
  await axiosInstance.delete(`/api/tickets/${id}`);
};

export const assignTicket = async (id, technicianId) => {
  const response = await axiosInstance.patch(`/api/tickets/${id}/assign`, { technicianId });
  return response.data;
};

export const addTicketReply = async (id, payload) => {
  const response = await axiosInstance.post(`/api/tickets/${id}/replies`, payload);
  return response.data;
};
