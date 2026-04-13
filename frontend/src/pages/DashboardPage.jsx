import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, getUnreadCount } from '../services/notificationService';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&auto=format&fit=crop&q=80';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      icon: '🔔'
    },
    {
      label: 'Unread',
      value: unreadCount,
      hint: 'Need your attention now',
      icon: '📬'
    },
    {
      label: 'Activity (7d)',
      value: weeklyActivityCount,
      hint: 'Recent campus system events',
      icon: '📈'
    },
    {
      label: 'Access Level',
      value: user?.role || 'N/A',
      hint: 'Current permission profile',
      icon: '🛡️'
    }
  ];

  const quickActions = [
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
    <div className="page-wrapper">
      <Navbar />

      <div className="page-container dashboard-page">
        {/* ── Hero Section ── */}
        <section className="dashboard-hero">
          <img
            src={HERO_IMAGE}
            alt="University campus aerial"
            className="dashboard-hero__bg"
          />
          <div className="dashboard-hero__overlay" />

          <div className="dashboard-hero__content">
            <p className="dashboard-kicker">Overview</p>
            <h1>Welcome back, {user?.name} 👋</h1>
            <p className="dashboard-subtitle">
              Your command center for account visibility, activity tracking, and quick actions.
            </p>
          </div>

          <div className="dashboard-hero-meta">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
        </section>

        {/* ── Stat Cards ── */}
        <section className="dashboard-grid stats-grid" aria-label="Stats">
          {statCards.map((item, i) => (
            <article key={item.label} className="stat-card">
              <div className="stat-card-stripe" />
              <span className="stat-icon-badge" role="img" aria-label={item.label}>
                {item.icon}
              </span>
              <p className="stat-label">{item.label}</p>
              <h3 className="stat-value">{item.value}</h3>
              <p className="stat-hint">{item.hint}</p>
            </article>
          ))}
        </section>

        {/* ── Content Grid ── */}
        <section className="dashboard-grid content-grid">
          {/* Quick Actions */}
          <article className="quick-actions-card">
            <h2>Quick Actions</h2>
            <p className="muted-text">Jump to frequent workflows with one click.</p>

            <div className="quick-actions-grid">
              {quickActions.map((action) =>
                action.isLink ? (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={`quick-tile ${action.theme}`}
                  >
                    <span className="quick-tile-emoji">{action.emoji}</span>
                    <h3>{action.label}</h3>
                    <p>{action.desc}</p>
                  </Link>
                ) : (
                  <button
                    key={action.label}
                    className={`quick-tile quick-tile-button ${action.theme}`}
                    onClick={action.onClick}
                  >
                    <span className="quick-tile-emoji">{action.emoji}</span>
                    <h3>{action.label}</h3>
                    <p>{action.desc}</p>
                  </button>
                )
              )}
            </div>
          </article>

          {/* Activity Timeline */}
          <article className="timeline-card">
            <h2>Activity Timeline</h2>
            <p className="muted-text">Latest system events linked to your account.</p>

            {loading ? (
              <p className="muted-text" style={{ marginTop: 16 }}>Loading timeline…</p>
            ) : recentNotifications.length === 0 ? (
              <p className="muted-text" style={{ marginTop: 16 }}>No activity yet. New events will appear here.</p>
            ) : (
              <div className="timeline-list">
                {recentNotifications.map((item) => (
                  <div key={item.id} className={`timeline-item ${item.isRead ? 'read' : 'unread'}`}>
                    <div className="timeline-dot-wrap">
                      <div className="timeline-dot" />
                    </div>
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
