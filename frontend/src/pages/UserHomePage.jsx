import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

function UserHomePage() {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Resources',
      subtitle: 'Explore campus facilities and availability.',
      to: '/resources',
      className: 'quick-tile quick-tile-theme-blue'
    },
    {
      title: user?.role === 'ADMIN' ? 'Bookings' : 'My Bookings',
      subtitle: 'Review and manage reservation requests.',
      to: '/bookings',
      className: 'quick-tile quick-tile-theme-cyan'
    },
    {
      title: user?.role === 'ADMIN' ? 'All Tickets' : user?.role === 'TECHNICIAN' ? 'Assigned Tickets' : 'My Tickets',
      subtitle: 'Track incidents and support progress.',
      to: '/tickets',
      className: 'quick-tile quick-tile-theme-amber'
    },
    {
      title: 'Dashboard',
      subtitle: 'Open your full analytics and activity overview.',
      to: '/dashboard',
      className: 'quick-tile quick-tile-theme-blue'
    }
  ];

  return (
    <DashboardLayout>
      <div className="page-container dashboard-page">
        <section className="card dashboard-hero fade-in">
          <div>
            <p className="dashboard-kicker">Welcome</p>
            <h1>Hi {user?.name}, your workspace is ready.</h1>
            <p className="dashboard-subtitle">
              Use the quick sections below to navigate resources, bookings, tickets, and your dashboard.
            </p>
          </div>
          <div className="dashboard-hero-meta">
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </section>

        <section className="card quick-actions-card">
          <h2>Quick Access</h2>
          <p className="muted-text">Everything you need is one click away.</p>
          <div className="quick-actions-grid" style={{ marginTop: '1rem' }}>
            {cards.map((card) => (
              <Link key={card.title} to={card.to} className={card.className}>
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default UserHomePage;
