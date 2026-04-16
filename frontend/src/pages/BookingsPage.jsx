import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  deleteBooking,
  decideBooking,
  getAllBookings,
  getMyBookings,
  updateBooking
} from '../services/bookingService';

const toDateTimeLocalValue = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 16);
};

const buildEditForm = (booking) => ({
  resourceId: booking.resourceId,
  resourceName: booking.resourceName,
  purpose: booking.purpose || '',
  startTime: toDateTimeLocalValue(booking.startTime),
  endTime: toDateTimeLocalValue(booking.endTime),
  attendeesCount: String(booking.attendeesCount ?? 1)
});

const formatDateTime = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
};

const formatStatusLabel = (status) => {
  if (!status) {
    return 'Pending';
  }

  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [removalRequestBooking, setRemovalRequestBooking] = useState(null);
  const [removalRequestReason, setRemovalRequestReason] = useState('');
  const [removalRequestSubmitting, setRemovalRequestSubmitting] = useState(false);
  const [removalRequestError, setRemovalRequestError] = useState('');
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const pageTitle = isAdmin ? 'Submitted Bookings' : 'My Bookings';
  const pageSubtitle = isAdmin
    ? 'Review all booking requests submitted by campus users.'
    : 'Track the booking requests you have already submitted.';
  const emptyMessage = isAdmin
    ? 'No booking requests have been submitted yet.'
    : 'You have not submitted any bookings yet.';

  const loadBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const data = isAdmin ? await getAllBookings() : await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingDecision = async (bookingId, payload, successMessage) => {
    setActionLoadingId(bookingId);
    setError('');
    setActionMessage('');

    try {
      await decideBooking(bookingId, payload);
      setActionMessage(successMessage);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptBooking = (booking) => {
    updateBookingDecision(
      booking.id,
      { status: 'APPROVED' },
      `Booking for ${booking.resourceName} was approved.`
    );
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setEditForm(buildEditForm(booking));
    setEditError('');
  };

  const closeEditModal = () => {
    if (editSubmitting) {
      return;
    }

    setEditingBooking(null);
    setEditForm(null);
    setEditError('');
  };

  const handleEditChange = (field, value) => {
    setEditForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const submitEditBooking = async (event) => {
    event.preventDefault();

    if (!editingBooking || !editForm) {
      return;
    }

    const attendeesCount = Number(editForm.attendeesCount);

    if (!Number.isInteger(attendeesCount) || attendeesCount < 1) {
      setEditError('Attendees count must be at least 1.');
      return;
    }

    if (new Date(editForm.startTime) >= new Date(editForm.endTime)) {
      setEditError('End time must be after the start time.');
      return;
    }

    setEditSubmitting(true);
    setEditError('');
    setError('');
    setActionMessage('');

    try {
      await updateBooking(editingBooking.id, {
        resourceId: editingBooking.resourceId,
        purpose: editForm.purpose.trim(),
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        attendeesCount
      });

      setActionMessage(`Booking for ${editingBooking.resourceName} was updated.`);
      setEditingBooking(null);
      setEditForm(null);
      await loadBookings();
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update booking');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteBooking = async (booking) => {
    const confirmed = window.confirm(`Delete the pending booking for ${booking.resourceName}?`);

    if (!confirmed) {
      return;
    }

    setActionLoadingId(booking.id);
    setError('');
    setActionMessage('');

    try {
      await deleteBooking(booking.id);
      setActionMessage(`Booking for ${booking.resourceName} was deleted.`);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRemovalRequestModal = (booking) => {
    setRemovalRequestBooking(booking);
    setRemovalRequestReason('');
    setRemovalRequestError('');
  };

  const closeRemovalRequestModal = () => {
    if (removalRequestSubmitting) {
      return;
    }

    setRemovalRequestBooking(null);
    setRemovalRequestReason('');
    setRemovalRequestError('');
  };

  const submitRemovalRequest = async (event) => {
    event.preventDefault();

    if (!removalRequestBooking) {
      return;
    }

    const trimmedReason = removalRequestReason.trim();
    if (!trimmedReason) {
      setRemovalRequestError('Removal reason is required when requesting removal.');
      return;
    }

    setRemovalRequestSubmitting(true);
    setRemovalRequestError('');
    setError('');
    setActionMessage('');

    try {
      await updateBooking(removalRequestBooking.id, {
        resourceId: removalRequestBooking.resourceId,
        purpose: removalRequestBooking.purpose,
        startTime: removalRequestBooking.startTime,
        endTime: removalRequestBooking.endTime,
        attendeesCount: removalRequestBooking.attendeesCount,
        status: 'REMOVAL_REQUEST',
        removalReason: trimmedReason
      });
      setActionMessage(`Removal request for ${removalRequestBooking.resourceName} was sent to the admin.`);
      setRemovalRequestBooking(null);
      setRemovalRequestReason('');
      await loadBookings();
    } catch (err) {
      setRemovalRequestError(err?.response?.data?.message || 'Failed to request booking removal');
    } finally {
      setRemovalRequestSubmitting(false);
    }
  };

  const handleAdminRemoveBooking = async (booking) => {
    const confirmed = window.confirm(`Remove the booking request for ${booking.resourceName}?`);

    if (!confirmed) {
      return;
    }

    setActionLoadingId(booking.id);
    setError('');
    setActionMessage('');

    try {
      await deleteBooking(booking.id);
      setActionMessage(`Booking for ${booking.resourceName} was removed.`);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectBooking = (booking) => {
    setRejectingBooking(booking);
    setRejectionReason('');
    setRejectError('');
  };

  const closeRejectModal = () => {
    if (actionLoadingId) {
      return;
    }

    setRejectingBooking(null);
    setRejectionReason('');
    setRejectError('');
  };

  const submitRejectReason = async (event) => {
    event.preventDefault();

    if (!rejectingBooking) {
      return;
    }

    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      setRejectError('Rejection reason is required when rejecting a booking.');
      return;
    }

    setRejectError('');
    await updateBookingDecision(
      rejectingBooking.id,
      { status: 'REJECTED', rejectionReason: trimmedReason },
      `Booking for ${rejectingBooking.resourceName} was rejected.`
    );
    setRejectingBooking(null);
    setRejectionReason('');
  };

  useEffect(() => {
    loadBookings();
  }, [isAdmin]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-container admin-bookings-page">
        <section className="card admin-bookings-header-row">
          <div>
            <p className="dashboard-kicker">Booking Section</p>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>

          <button type="button" className="secondary-btn" onClick={loadBookings} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </section>

        {error ? <p className="error-text">{error}</p> : null}
        {actionMessage ? <p className="success-text">{actionMessage}</p> : null}

        {loading ? (
          <div className="card">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="card">
            <p className="muted-text">{emptyMessage}</p>
          </div>
        ) : isAdmin ? (
          <section className="card admin-bookings-table-card" aria-label="Submitted bookings">
            <div className="admin-bookings-table-header">
              <div>
                <h2>Submitted Bookings</h2>
                <p className="muted-text">All bookings currently in the system, shown in a table view.</p>
              </div>
              <span className="admin-bookings-count">{bookings.length} requests</span>
            </div>

            <div className="table-scroll-wrap">
              <table className="user-table admin-bookings-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Submitted By</th>
                    <th>Schedule</th>
                    <th>Attendees</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className={booking.status === 'REMOVAL_REQUEST' ? 'booking-row-removal-request' : ''}
                    >
                      <td>
                        <strong>{booking.resourceName}</strong>
                        <div className="table-subtext">{booking.resourceLocation || 'N/A'}</div>
                      </td>
                      <td>
                        <strong>{booking.userName}</strong>
                        <div className="table-subtext">{booking.userEmail || 'N/A'}</div>
                      </td>
                      <td>
                        <div>{formatDateTime(booking.startTime)}</div>
                        <div className="table-subtext">to {formatDateTime(booking.endTime)}</div>
                      </td>
                      <td>{booking.attendeesCount ?? 'N/A'}</td>
                      <td className="booking-purpose-cell">{booking.purpose}</td>
                      <td>
                        <span className={`request-status request-status-${booking.status?.toLowerCase() || 'pending'}`}>
                          {formatStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td>{formatDateTime(booking.createdAt)}</td>
                      <td
                        className={`booking-reason-cell ${booking.status === 'REMOVAL_REQUEST' ? 'booking-reason-cell-removal' : ''}`}
                      >
                        {booking.removalReason || booking.rejectionReason || '—'}
                      </td>
                      <td>
                        <div
                          className={`table-actions booking-table-actions ${booking.status === 'REMOVAL_REQUEST' ? 'booking-table-actions-removal' : ''}`}
                        >
                          {booking.status === 'PENDING' ? (
                            <>
                              <button
                                type="button"
                                className="small-btn booking-action-accept"
                                onClick={() => handleAcceptBooking(booking)}
                                disabled={actionLoadingId === booking.id}
                              >
                                {actionLoadingId === booking.id ? 'Working...' : 'Accept'}
                              </button>
                              <button
                                type="button"
                                className="secondary-btn booking-action-reject"
                                onClick={() => handleRejectBooking(booking)}
                                disabled={actionLoadingId === booking.id}
                              >
                                Reject
                              </button>
                            </>
                          ) : null}

                          {booking.status === 'REMOVAL_REQUEST' ? (
                            <button
                              type="button"
                              className="small-btn booking-action-remove"
                              onClick={() => handleAdminRemoveBooking(booking)}
                              disabled={actionLoadingId === booking.id}
                            >
                              {actionLoadingId === booking.id ? 'Working...' : 'Remove'}
                            </button>
                          ) : null}

                          {!booking.status || (booking.status !== 'PENDING' && booking.status !== 'REMOVAL_REQUEST') ? (
                            <span className="table-empty-action">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="card my-bookings-card" aria-label="My bookings">
            <h2>Booking History</h2>
            <p className="muted-text">These are the bookings you have already submitted.</p>

            <div className="my-bookings-list">
              {bookings.map((booking) => (
                <article key={booking.id} className="my-booking-item">
                  <div>
                    <h4>{booking.resourceName}</h4>
                    <p>{booking.resourceLocation || 'N/A'}</p>
                    <p>
                      {formatDateTime(booking.startTime)} to {formatDateTime(booking.endTime)}
                    </p>
                    <p>Purpose: {booking.purpose}</p>
                    <p>Attendees: {booking.attendeesCount ?? 'N/A'}</p>
                    <p>Submitted: {formatDateTime(booking.createdAt)}</p>
                    {booking.status === 'REJECTED' && booking.rejectionReason ? (
                      <p className="error-text">Rejection reason: {booking.rejectionReason}</p>
                    ) : null}
                    {booking.status === 'REMOVAL_REQUEST' && booking.removalReason ? (
                      <p className="error-text">Removal reason: {booking.removalReason}</p>
                    ) : null}
                  </div>

                  <div className="my-booking-side">
                    <span className={`request-status request-status-${booking.status?.toLowerCase() || 'pending'}`}>
                      {formatStatusLabel(booking.status)}
                    </span>

                    <div className="my-booking-actions">
                      {booking.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            className="small-btn"
                            onClick={() => openEditModal(booking)}
                            disabled={actionLoadingId === booking.id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => handleDeleteBooking(booking)}
                            disabled={actionLoadingId === booking.id}
                          >
                            Delete
                          </button>
                        </>
                      ) : null}

                      {booking.status === 'APPROVED' ? (
                        <button
                          type="button"
                          className="secondary-btn booking-request-remove-btn"
                          onClick={() => openRemovalRequestModal(booking)}
                          disabled={actionLoadingId === booking.id}
                        >
                          Request Remove
                        </button>
                      ) : null}

                      {booking.status === 'REMOVAL_REQUEST' ? (
                        <span className="muted-text">Removal request pending admin review.</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {editingBooking && editForm ? (
        <div className="booking-modal-backdrop" role="presentation" onClick={closeEditModal}>
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-booking-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-modal-header">
              <div>
                <p className="dashboard-kicker">Edit Booking</p>
                <h2 id="edit-booking-title">{editingBooking.resourceName}</h2>
                <p>{editingBooking.resourceLocation || 'N/A'}</p>
              </div>
              <button type="button" className="icon-close-btn" onClick={closeEditModal} aria-label="Close edit form">
                ×
              </button>
            </div>

            <form className="booking-form" onSubmit={submitEditBooking}>
              <label>
                Purpose
                <input
                  type="text"
                  className="text-input"
                  value={editForm.purpose}
                  onChange={(event) => handleEditChange('purpose', event.target.value)}
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
                    value={editForm.startTime}
                    onChange={(event) => handleEditChange('startTime', event.target.value)}
                    required
                  />
                </label>

                <label>
                  End time
                  <input
                    type="datetime-local"
                    className="text-input"
                    value={editForm.endTime}
                    onChange={(event) => handleEditChange('endTime', event.target.value)}
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
                  value={editForm.attendeesCount}
                  onChange={(event) => handleEditChange('attendeesCount', event.target.value)}
                  required
                />
              </label>

              <small>The booking will be resubmitted as pending after you save changes.</small>

              {editError ? <p className="error-text">{editError}</p> : null}

              <div className="booking-modal-actions">
                <button type="button" className="secondary-btn" onClick={closeEditModal} disabled={editSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {removalRequestBooking ? (
        <div className="booking-modal-backdrop" role="presentation" onClick={closeRemovalRequestModal}>
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-booking-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-modal-header">
              <div>
                <p className="dashboard-kicker">Request Remove</p>
                <h2 id="remove-booking-title">{removalRequestBooking.resourceName}</h2>
                <p>{removalRequestBooking.resourceLocation || 'N/A'}</p>
              </div>
              <button
                type="button"
                className="icon-close-btn"
                onClick={closeRemovalRequestModal}
                aria-label="Close removal request form"
              >
                ×
              </button>
            </div>

            <form className="booking-form" onSubmit={submitRemovalRequest}>
              <label>
                Reason to remove
                <textarea
                  className="text-input booking-reject-textarea"
                  value={removalRequestReason}
                  onChange={(event) => setRemovalRequestReason(event.target.value)}
                  placeholder="Explain why this booking should be removed..."
                  maxLength={255}
                  rows={5}
                  required
                />
              </label>

              <small>This reason will be sent to the admin with the removal request.</small>

              {removalRequestError ? <p className="error-text">{removalRequestError}</p> : null}

              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeRemovalRequestModal}
                  disabled={removalRequestSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={removalRequestSubmitting}>
                  {removalRequestSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {rejectingBooking ? (
        <div className="booking-modal-backdrop" role="presentation" onClick={closeRejectModal}>
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-booking-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-modal-header">
              <div>
                <p className="dashboard-kicker">Reject Booking</p>
                <h2 id="reject-booking-title">{rejectingBooking.resourceName}</h2>
                <p>
                  Submitted by {rejectingBooking.userName} · {formatDateTime(rejectingBooking.createdAt)}
                </p>
              </div>
              <button type="button" className="icon-close-btn" onClick={closeRejectModal} aria-label="Close reject form">
                ×
              </button>
            </div>

            <form className="booking-form" onSubmit={submitRejectReason}>
              <label>
                Rejection reason
                <textarea
                  className="text-input booking-reject-textarea"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Explain why this booking is being rejected..."
                  maxLength={255}
                  rows={5}
                  required
                />
              </label>

              <small>This reason will be visible to the user who submitted the booking.</small>

              {rejectError ? <p className="error-text">{rejectError}</p> : null}

              <div className="booking-modal-actions">
                <button type="button" className="secondary-btn" onClick={closeRejectModal} disabled={actionLoadingId !== null}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={actionLoadingId !== null}>
                  Reject Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default BookingsPage;