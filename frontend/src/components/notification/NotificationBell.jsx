function NotificationBell({ unreadCount, onClick }) {
  return (
    <button className="notification-bell" onClick={onClick}>
      <span>🔔</span>
      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
    </button>
  );
}

export default NotificationBell;
