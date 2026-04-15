import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { getResources } from '../services/resourceService';
import { createBooking } from '../services/bookingService';

const BOOKING_DURATION_HOURS = 2;

const toDateTimeLocalValue = (date) => {
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 16);
};

const buildDefaultBookingForm = () => {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + 1, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + BOOKING_DURATION_HOURS);

  return {
    purpose: '',
    startTime: toDateTimeLocalValue(startTime),
    endTime: toDateTimeLocalValue(endTime),
    attendeesCount: '1'
  };
};

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
  const [bookingMessage, setBookingMessage] = useState('');

  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingForm, setBookingForm] = useState(buildDefaultBookingForm);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

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

  const openBookingModal = (resource) => {
    setSelectedResource(resource);
    setBookingForm(buildDefaultBookingForm());
    setBookingError('');
  };

  const closeBookingModal = () => {
    if (bookingSubmitting) {
      return;
    }

    setSelectedResource(null);
    setBookingError('');
  };

  const handleBookingChange = (field, value) => {
    setBookingForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!selectedResource) {
      return;
    }

    const attendeesCount = Number(bookingForm.attendeesCount);

    if (!Number.isInteger(attendeesCount) || attendeesCount < 1) {
      setBookingError('Attendees count must be at least 1.');
      return;
    }

    if (new Date(bookingForm.startTime) >= new Date(bookingForm.endTime)) {
      setBookingError('End time must be after the start time.');
      return;
    }

    setBookingSubmitting(true);
    setBookingError('');

    try {
      await createBooking({
        resourceId: selectedResource.id,
        purpose: bookingForm.purpose.trim(),
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        attendeesCount
      });

      setBookingMessage(`Booking request for ${selectedResource.name} was submitted.`);
      setSelectedResource(null);
    } catch (err) {
      setBookingError(err?.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

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
          {bookingMessage ? <p className="success-text">{bookingMessage}</p> : null}
        </section>

        {loading ? (
          <div className="card" style={{ marginTop: 16 }}>Loading resources...</div>
        ) : (
          <section className="resource-grid" aria-label="Campus resources">
            {resources.map((resource) => (
              <article key={resource.id} className={`resource-card ${resource.status !== 'ACTIVE' ? 'resource-card-disabled' : ''}`}>
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

                  <div className="resource-card-actions">
                    <button
                      type="button"
                      className="primary-btn resource-booking-btn"
                      onClick={() => openBookingModal(resource)}
                      disabled={resource.status !== 'ACTIVE'}
                    >
                      Create Booking
                    </button>
                    {resource.status !== 'ACTIVE' ? (
                      <span className="resource-action-note">Unavailable for booking</span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {selectedResource ? (
          <div className="booking-modal-backdrop" role="presentation" onClick={closeBookingModal}>
            <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title" onClick={(event) => event.stopPropagation()}>
              <div className="booking-modal-header">
                <div>
                  <p className="dashboard-kicker">Create Booking</p>
                  <h2 id="booking-modal-title">{selectedResource.name}</h2>
                  <p>{selectedResource.location} · Capacity {selectedResource.capacity}</p>
                </div>
                <button type="button" className="icon-close-btn" onClick={closeBookingModal} aria-label="Close booking form">
                  ×
                </button>
              </div>

              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <label>
                  Purpose
                  <input
                    type="text"
                    className="text-input"
                    value={bookingForm.purpose}
                    onChange={(event) => handleBookingChange('purpose', event.target.value)}
                    placeholder="Study session, lecture, club meeting..."
                    maxLength={255}
                    required
                  />
                </label>

                <div className="booking-time-grid">
                  <label>
                    Start time
                    <input
                      type="datetime-local"
                      className="text-input"
                      value={bookingForm.startTime}
                      onChange={(event) => handleBookingChange('startTime', event.target.value)}
                      required
                    />
                  </label>

                  <label>
                    End time
                    <input
                      type="datetime-local"
                      className="text-input"
                      value={bookingForm.endTime}
                      onChange={(event) => handleBookingChange('endTime', event.target.value)}
                      required
                    />
                  </label>
                </div>

                <label>
                  Attendees count
                  <input
                    type="number"
                    className="text-input"
                    min="1"
                    step="1"
                    value={bookingForm.attendeesCount}
                    onChange={(event) => handleBookingChange('attendeesCount', event.target.value)}
                    required
                  />
                </label>

                <small>This request will be sent to the booking service as a pending reservation.</small>

                {bookingError ? <p className="error-text">{bookingError}</p> : null}

                <div className="booking-modal-actions">
                  <button type="button" className="secondary-btn" onClick={closeBookingModal} disabled={bookingSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={bookingSubmitting}>
                    {bookingSubmitting ? 'Submitting...' : 'Submit Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ResourcesPage;
