import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/notification/NotificationPanel';
import { getUnreadCount } from '../services/notificationService';

const USER_NAV = [
  { to: '/resources',  icon: '🏢', label: 'Resources' },
  { to: '/bookings',   icon: '📅', label: 'My Bookings' },
  { to: '/tickets',    icon: '🎫', label: 'My Tickets' },
  { to: '/profile',    icon: '👤', label: 'Profile' },
];

const ADMIN_NAV = [
  { to: '/dashboard',       icon: '⊞',  label: 'Dashboard' },
  { to: '/resources',       icon: '🏢', label: 'Resources' },
  { to: '/bookings',        icon: '📅', label: 'Booking Requests' },
  { to: '/tickets',         icon: '🎫', label: 'All Tickets' },
  { section: 'Administration' },
  { to: '/admin/users',     icon: '👥', label: 'Manage Users' },
  { to: '/admin/resources', icon: '⚙️', label: 'Manage Resources' },
  { to: '/profile',         icon: '👤', label: 'Profile' },
];

const TECHNICIAN_NAV = [
  { to: '/dashboard', icon: '⊞',  label: 'Dashboard' },
  { to: '/resources', icon: '🏢', label: 'Resources' },
  { to: '/tickets',   icon: '🔧', label: 'Assigned Tickets' },
  { to: '/profile',   icon: '👤', label: 'Profile' },
];

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getPageTitle(pathname) {
  const map = {
    '/home': 'Home',
    '/dashboard': 'Dashboard',
    '/resources': 'Resources',
    '/bookings': 'Bookings',
    '/tickets': 'Tickets',
    '/admin/users': 'User Management',
    '/admin/resources': 'Resource Management',
    '/profile': 'My Profile',
  };
  return map[pathname] || 'Smart Campus';
}

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const navItems =
    user?.role === 'ADMIN'      ? ADMIN_NAV :
    user?.role === 'TECHNICIAN' ? TECHNICIAN_NAV :
    USER_NAV;

  useEffect(() => {
    getUnreadCount().then(d => setUnreadCount(d.unreadCount)).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sc-layout">
      {/* Sidebar */}
      <aside className="sc-sidebar">
        <div className="sc-sidebar-brand">
          <div className="sc-sidebar-brand-icon">🎓</div>
          <div className="sc-sidebar-brand-text">
            <h2>Smart Campus</h2>
            <p>Operations Hub</p>
          </div>
        </div>

        <nav className="sc-sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} className="sc-sidebar-section">{item.section}</div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sc-nav-link${isActive ? ' active' : ''}`}
              >
                <span className="sc-nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="sc-sidebar-footer">
          <button className="sc-logout-btn" onClick={handleLogout}>
            <span className="sc-nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="sc-topbar">
        <div className="sc-topbar-left">
          <span className="sc-topbar-title">{getPageTitle(location.pathname)}</span>
        </div>
        <div className="sc-topbar-right">
          {/* Notification Bell */}
          <button
            className="notification-bell"
            onClick={() => { setPanelOpen(p => !p); setDropdownOpen(false); }}
            aria-label="Notifications"
          >
            <span>🔔</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {/* User Dropdown */}
          <div className="sc-user-dropdown-wrap" ref={dropdownRef}>
            <button
              className="sc-avatar"
              onClick={() => { setDropdownOpen(p => !p); setPanelOpen(false); }}
              aria-label="User menu"
            >
              {user?.profilePicture
                ? <img src={user.profilePicture} alt={user?.name} />
                : getInitials(user?.name)
              }
            </button>

            {dropdownOpen && (
              <div className="sc-user-dropdown">
                <div className="sc-user-dropdown-header">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
                <div className="sc-user-dropdown-divider" />
                <NavLink
                  to="/profile"
                  className="sc-user-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  👤 Profile
                </NavLink>
                <NavLink
                  to="/resources"
                  className="sc-user-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  🏢 Resources
                </NavLink>
                <div className="sc-user-dropdown-divider" />
                <button className="sc-user-dropdown-item danger" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel open={panelOpen} />

      {/* Main Content */}
      <main className="sc-main fade-in">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
