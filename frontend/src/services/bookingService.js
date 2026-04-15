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

export const decideBooking = async (bookingId, payload) => {
  const response = await axiosInstance.patch(`/api/bookings/${bookingId}/decision`, payload);
  return response.data;
};
