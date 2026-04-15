import axiosInstance from '../api/axiosInstance';

export const createBooking = async (payload) => {
  const response = await axiosInstance.post('/api/bookings', payload);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await axiosInstance.get('/api/bookings/mine');
  return response.data;
};

export const getAllBookings = async () => {
  const response = await axiosInstance.get('/api/bookings');
  return response.data;
};

export const getResourceBookings = async (resourceId) => {
  const response = await axiosInstance.get(`/api/bookings/resource/${resourceId}`);
  return response.data;
};

export const decideBooking = async (bookingId, payload) => {
  const response = await axiosInstance.patch(`/api/bookings/${bookingId}/decision`, payload);
  return response.data;
};

export const updateBooking = async (bookingId, payload) => {
  const response = await axiosInstance.put(`/api/bookings/${bookingId}`, payload);
  return response.data;
};

export const deleteBooking = async (bookingId) => {
  await axiosInstance.delete(`/api/bookings/${bookingId}`);
};
