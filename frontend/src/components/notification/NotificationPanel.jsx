import { useEffect, useState } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../../services/notificationService';

function NotificationPanel({ open }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [list, unread] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      setNotifications(list);
      setUnreadCount(unread.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const handleRead = async (id) => {
    await markNotificationAsRead(id);
    await loadNotifications();
  };

  const handleReadAll = async () => {
    await markAllNotificationsAsRead();
    await loadNotifications();
  };

  if (!open) return null;

  return (
    <div className="notification-panel">
      <div className="notification-panel-header">
        <h3>Notifications</h3>
        <button className="text-btn" onClick={handleReadAll}>Mark all as read</button>
      </div>

      <p className="notification-meta">Unread: {unreadCount}</p>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div className="notification-list">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`notification-item ${item.isRead ? 'read' : 'unread'}`}
            >
              <div>
                <h4>{item.title}</h4>
                <p>{item.message}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>

              {!item.isRead && (
                <button className="small-btn" onClick={() => handleRead(item.id)}>
                  Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
