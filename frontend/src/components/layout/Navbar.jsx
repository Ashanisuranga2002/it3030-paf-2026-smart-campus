import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notification/NotificationBell';
import NotificationPanel from '../notification/NotificationPanel';
import { getUnreadCount } from '../../services/notificationService';

function Navbar() {
  const { user, logout } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnread = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load unread count', error);
    }
  };

  useEffect(() => {
    loadUnread();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/dashboard" className="navbar-logo" style={{ textDecoration: 'none' }}>
        <div className="navbar-logo-icon">🏛️</div>
        <h2>Smart Campus</h2>
      </Link>

      {/* Right controls */}
      <div className="navbar-right">
        <NotificationBell
          unreadCount={unreadCount}
          onClick={() => setPanelOpen((prev) => !prev)}
        />

        <div className="user-box">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="avatar" />
          ) : (
            <div className="avatar-placeholder" aria-hidden="true">{initials}</div>
          )}
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.role}</p>
          </div>
        </div>

        <Link className="secondary-btn nav-link-btn" to="/resources">
          Resources
        </Link>

        {user?.role === 'ADMIN' && (
          <>
            <Link className="secondary-btn nav-link-btn" to="/admin/resources">
              Manage Resources
            </Link>
            <Link className="secondary-btn nav-link-btn" to="/admin/users">
              Manage Users
            </Link>
          </>
        )}

        <button className="secondary-btn" onClick={logout}>Logout</button>
      </div>

      <NotificationPanel open={panelOpen} />
    </nav>
  );
}

export default Navbar;
