import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, getUnreadCount } from '../services/notificationService';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleParallaxMove = (event) => {
    const { innerWidth, innerHeight } = window;
    const x = ((event.clientX / innerWidth) - 0.5) * 16;
    const y = ((event.clientY / innerHeight) - 0.5) * 16;
    setParallax({ x, y });
  };

  const resetParallax = () => {
    setParallax({ x: 0, y: 0 });
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [list, unread] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      setNotifications(list);
      setUnreadCount(unread.unreadCount);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [notifications]);

  const weeklyActivityCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return notifications.filter((item) => new Date(item.createdAt).getTime() >= sevenDaysAgo).length;
  }, [notifications]);

  const statCards = [
    {
      label: 'Total Alerts',
      value: notifications.length,
      hint: 'All-time notification records',
      icon: 'AL'
    },
    {
      label: 'Unread',
      value: unreadCount,
      hint: 'Need your attention now',
      icon: 'UR'
    },
    {
      label: 'Activity (7 days)',
      value: weeklyActivityCount,
      hint: 'Recent campus system events',
      icon: 'WK'
    },
    {
      label: 'Access Level',
      value: user?.role || 'N/A',
      hint: 'Current permission profile',
      icon: 'RL'
    }
  ];

  const quickActions = [
    {
      to: '/resources',
      label: 'Resource Management',
      desc: 'Browse facilities and view campus resource details.',
      emoji: '🏢',
      theme: 'quick-tile-theme-blue',
      isLink: true,
    },
    {
      to: '/dashboard',
      label: 'Refresh Dashboard',
      desc: 'Reload your command center and recalculate live metrics.',
      emoji: '🔄',
      theme: 'quick-tile-theme-blue',
      isLink: true,
    },
    {
      onClick: loadDashboardData,
      label: 'Sync Activity',
      desc: 'Pull latest alerts and timeline items from the server.',
      emoji: '⚡',
      theme: 'quick-tile-theme-cyan',
      isLink: false,
    },
    ...(user?.role === 'ADMIN' ? [{
      to: '/admin/users',
      label: 'Manage Users',
      desc: 'Open role-based user administration and account controls.',
      emoji: '👥',
      theme: 'quick-tile-theme-amber quick-tile-admin',
      isLink: true,
    }, {
      to: '/admin/resources',
      label: 'Manage Resources',
      desc: 'Create, update, and remove campus resources.',
      emoji: '🏢',
      theme: 'quick-tile-theme-cyan quick-tile-admin',
      isLink: true,
    }] : []),
    {
      onClick: logout,
      label: 'Secure Logout',
      desc: 'End your current session and return to the login portal.',
      emoji: '🔒',
      theme: 'quick-tile-danger quick-tile-theme-rose',
      isLink: false,
    },
  ];

  return (
    <div
      style={{ '--px': `${parallax.x}px`, '--py': `${parallax.y}px` }}
      onMouseMove={handleParallaxMove}
      onMouseLeave={resetParallax}
    >
      <Navbar />

      <div className="page-container dashboard-page">
        <section className="card dashboard-hero">
          <div>
            <p className="dashboard-kicker">Overview</p>
            <h1>Welcome back, {user?.name}</h1>
            <p className="dashboard-subtitle">
              Your command center for account visibility, activity tracking, and quick actions.
            </p>
          </div>
          <div className="dashboard-hero-meta">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
        </section>

        <section className="dashboard-grid stats-grid" aria-label="Stats">
          {statCards.map((item) => (
            <article key={item.label} className="card stat-card">
              <span className="stat-icon-badge">{item.icon}</span>
              <p className="stat-label">{item.label}</p>
              <h3 className="stat-value">{item.value}</h3>
              <p className="stat-hint">{item.hint}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-grid content-grid">
          <article className="card quick-actions-card">
            <h2>Quick Actions</h2>
            <p className="muted-text">Jump to frequent workflows with one click.</p>

            <div className="quick-actions-grid">
              <Link to="/dashboard" className="quick-tile quick-tile-theme-blue">
                <h3>Refresh Dashboard</h3>
                <p>Reload your command center and recalculate live metrics.</p>
              </Link>

              <button
                className="quick-tile quick-tile-button quick-tile-theme-cyan"
                onClick={loadDashboardData}
              >
                <h3>Sync Activity</h3>
                <p>Pull latest alerts and timeline items from the server.</p>
              </button>

              {user?.role === 'ADMIN' && (
                <Link to="/admin/users" className="quick-tile quick-tile-admin quick-tile-theme-amber">
                  <h3>Manage Users</h3>
                  <p>Open role-based user administration and account controls.</p>
                </Link>
              )}

              <button
                className="quick-tile quick-tile-danger quick-tile-button quick-tile-theme-rose"
                onClick={logout}
              >
                <h3>Secure Logout</h3>
                <p>End your current session and return to the login portal.</p>
              </button>
            </div>
          </article>

          <article className="card timeline-card">
            <h2>Activity Timeline</h2>
            <p className="muted-text">Latest system events linked to your account.</p>

            {loading ? (
              <p className="muted-text">Loading timeline...</p>
            ) : recentNotifications.length === 0 ? (
              <p className="muted-text">No activity yet. New events will appear here.</p>
            ) : (
              <div className="timeline-list">
                {recentNotifications.map((item) => (
                  <div key={item.id} className={`timeline-item ${item.isRead ? 'read' : 'unread'}`}>
                    <div className="timeline-dot" />
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.message}</p>
                      <small>{new Date(item.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
