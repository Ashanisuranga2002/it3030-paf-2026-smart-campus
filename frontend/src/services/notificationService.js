import axiosInstance from '../api/axiosInstance';

export const getNotifications = async () => {
  const response = await axiosInstance.get('/api/notifications');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/api/notifications/unread-count');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  await axiosInstance.patch(`/api/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await axiosInstance.patch('/api/notifications/read-all');
};
