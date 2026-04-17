import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: '🏢',
    title: 'Campus Resources',
    desc: 'Browse and book classrooms, labs, auditoriums, and more. Real-time availability at your fingertips.',
  },
  {
    icon: '📅',
    title: 'Smart Bookings',
    desc: 'Request, track, and manage your facility bookings with automated approval workflows.',
  },
  {
    icon: '🎫',
    title: 'Incident Tickets',
    desc: 'Report maintenance issues and track resolutions. Get notified every step of the way.',
  },
];

const stats = [
  { num: '500+', label: 'Campus Resources' },
  { num: '2,400+', label: 'Active Students' },
  { num: '98%',  label: 'Uptime' },
  { num: '24/7', label: 'Support' },
];

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-brand">
          <div className="home-nav-icon">🎓</div>
          <div>
            <h2>Smart Campus</h2>
            <span>Operations Hub</span>
          </div>
        </div>
        <div className="home-nav-actions">
          {isAuthenticated ? (
            <Link to="/home" className="btn btn-primary">Go to Home →</Link>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div>
          <div className="home-hero-badge">
            <span className="home-hero-badge-dot" />
            Now live for all campus members
          </div>
          <h1>
            Your Campus,<br />
            <span>Smarter Every Day</span>
          </h1>
          <p className="home-hero-sub">
            The all-in-one platform to book facilities, manage resources,
            report incidents, and stay connected with campus life.
          </p>
          <div className="home-hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
            <Link to="/login"    className="btn btn-ghost btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="home-stats">
        {stats.map(s => (
          <div key={s.label} className="home-stat">
            <span className="home-stat-num">{s.num}</span>
            <p className="home-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ background: 'var(--c-bg)', paddingBottom: '1rem' }}>
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem 0' }}>
          <h2 style={{ color: 'var(--c-text)', fontSize: '1.7rem' }}>Everything you need in one place</h2>
          <p style={{ margin: '.6rem auto 0', maxWidth: '480px' }}>
            Manage your entire campus experience from a single, beautiful dashboard.
          </p>
        </div>
        <div className="home-features">
          {features.map(f => (
            <div key={f.title} className="home-feature-card card-hover">
              <div className="home-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '4rem 2rem',
        background: 'linear-gradient(160deg, #0d3526 0%, #0f172a 100%)',
        borderTop: '1px solid var(--c-border)'
      }}>
        <h2 style={{ color: 'var(--c-text)', fontSize: '1.8rem', marginBottom: '.75rem' }}>
          Ready to simplify campus life?
        </h2>
        <p style={{ marginBottom: '2rem' }}>Join thousands of students and staff already using Smart Campus.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          <Link to="/login"    className="btn btn-outline btn-lg">Sign In</Link>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 Smart Campus Operations Hub · Built for university excellence</p>
      </footer>
    </div>
  );
}

export default HomePage;
