import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { decideBooking, getAllBookings, getMyBookings } from '../services/bookingService';

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

  return status.charAt(0) + status.slice(1).toLowerCase();
};

function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
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
                    <th>Rejection Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
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
                      <td className="booking-reason-cell">
                        {booking.status === 'REJECTED' && booking.rejectionReason ? booking.rejectionReason : '—'}
                      </td>
                      <td>
                        <div className="table-actions booking-table-actions">
                          <button
                            type="button"
                            className="small-btn booking-action-accept"
                            onClick={() => handleAcceptBooking(booking)}
                            disabled={actionLoadingId === booking.id || booking.status !== 'PENDING'}
                          >
                            {actionLoadingId === booking.id ? 'Working...' : 'Accept'}
                          </button>
                          <button
                            type="button"
                            className="secondary-btn booking-action-reject"
                            onClick={() => handleRejectBooking(booking)}
                            disabled={actionLoadingId === booking.id || booking.status !== 'PENDING'}
                          >
                            Reject
                          </button>
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
                  </div>

                  <span className={`request-status request-status-${booking.status?.toLowerCase() || 'pending'}`}>
                    {formatStatusLabel(booking.status)}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

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