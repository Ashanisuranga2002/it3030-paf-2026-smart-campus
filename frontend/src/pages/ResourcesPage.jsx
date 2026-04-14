import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { getResources } from '../services/resourceService';

const typeOptions = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Auditorium', value: 'AUDITORIUM' },
  { label: 'Lab', value: 'LAB' },
  { label: 'Classroom', value: 'CLASSROOM' },
  { label: 'Meeting Room', value: 'MEETING_ROOM' },
  { label: 'Library', value: 'LIBRARY' },
  { label: 'Sports', value: 'SPORTS' }
];

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Out of Service', value: 'OUT_OF_SERVICE' }
];

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const loadResources = async () => {
    setLoading(true);
    setError('');
    try {
      const resourcesData = await getResources({ search, type, status });
      setResources(resourcesData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [search, type, status]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-container resources-page">
        <section className="resources-header card">
          <h1>Facilities &amp; Assets</h1>
          <p>Browse campus resources created by administrators.</p>

          <div className="resources-filter-row">
            <div className="resources-search-box">
              <span className="resources-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select value={type} onChange={(e) => setType(e.target.value)}>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </section>

        {loading ? (
          <div className="card" style={{ marginTop: 16 }}>Loading resources...</div>
        ) : (
          <section className="resource-grid" aria-label="Campus resources">
            {resources.map((resource) => (
              <article key={resource.id} className="resource-card">
                <div className="resource-card-media-wrap">
                  <img src={resource.imageUrl} alt={resource.name} className="resource-card-media" />
                  <span className="resource-type-badge">{resource.type.replace('_', ' ')}</span>
                  <span className={`resource-status-chip ${resource.status === 'ACTIVE' ? 'active' : 'out'}`}>
                    {resource.status === 'ACTIVE' ? 'ACTIVE' : 'OUT OF SERVICE'}
                  </span>
                </div>

                <div className="resource-card-body">
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>

                  <div className="resource-meta-row">
                    <span>📍 {resource.location}</span>
                    <span>👥 Capacity: {resource.capacity}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default ResourcesPage;
