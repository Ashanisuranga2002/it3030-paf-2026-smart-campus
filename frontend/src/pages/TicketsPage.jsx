import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TicketFormModal from '../components/ticket/TicketFormModal';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../services/userManagementService';
import {
  addTicketReply,
  assignTicket,
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket
} from '../services/ticketService';

function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [technicianSelection, setTechnicianSelection] = useState({});
  const [adminFilter, setAdminFilter] = useState('ALL');

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const canReply = (ticket) => {
    if (isAdmin) return true;
    if (!isTechnician) return false;

    if (ticket.assignedToId != null && user?.id != null) {
      return ticket.assignedToId === user.id;
    }

    return (ticket.assignedToEmail || '').toLowerCase() === (user?.email || '').toLowerCase();
  };

  const loadTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to load tickets';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    if (!isAdmin) return;

    try {
      const users = await getAllUsers();
      setTechnicians(users.filter((item) => item.role === 'TECHNICIAN' && item.active));
    } catch (err) {
      console.error('Failed to load technicians', err);
    }
  };

  useEffect(() => {
    loadTickets();
    loadTechnicians();
  }, []);

  const sortedTickets = useMemo(() => {
    const ordered = [...tickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (!isAdmin || adminFilter === 'ALL') {
      return ordered;
    }

    if (adminFilter === 'ASSIGNED') {
      return ordered.filter((ticket) => ticket.assignedToId != null);
    }

    if (adminFilter === 'REPLIED') {
      return ordered.filter((ticket) => (ticket.replies?.length || 0) > 0);
    }

    return ordered;
  }, [tickets, isAdmin, adminFilter]);

  const createTicketInitialValues = useMemo(
    () => ({ contactEmail: user?.email || '' }),
    [user?.email]
  );

  const clearStatus = () => {
    setError('');
    setSuccess('');
  };

  const handleCreateTicket = async (payload) => {
    setSubmitting(true);
    clearStatus();

    try {
      await createTicket(payload);
      setShowCreateModal(false);
      setSuccess('Ticket raised successfully.');
      await loadTickets();
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to raise ticket';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicket = async (payload) => {
    if (!editingTicket) return;

    setSubmitting(true);
    clearStatus();

    try {
      await updateTicket(editingTicket.id, payload);
      setEditingTicket(null);
      setSuccess('Ticket updated successfully.');
      await loadTickets();
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to update ticket';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const confirmed = window.confirm('Delete this ticket? This action cannot be undone.');
    if (!confirmed) return;

    clearStatus();

    try {
      await deleteTicket(ticketId);
      setSuccess('Ticket deleted successfully.');
      await loadTickets();
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to delete ticket';
      setError(message);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    const technicianId = technicianSelection[ticketId];
    if (!technicianId) {
      setError('Select a technician before assigning this ticket.');
      return;
    }

    clearStatus();

    try {
      await assignTicket(ticketId, Number(technicianId));
      setSuccess('Ticket assigned to technician.');
      await loadTickets();
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to assign ticket';
      setError(message);
    }
  };

  const handleReply = async (ticketId) => {
    const draft = replyDrafts[ticketId] || { message: '', status: '' };
    if (!draft.message?.trim()) {
      setError('Reply message cannot be empty.');
      return;
    }

    clearStatus();

    try {
      await addTicketReply(ticketId, {
        message: draft.message.trim(),
        status: draft.status || null
      });

      setReplyDrafts((prev) => ({
        ...prev,
        [ticketId]: { message: '', status: '' }
      }));
      setSuccess('Reply posted successfully.');
      await loadTickets();
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to post reply';
      setError(message);
    }
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    clearStatus();
  };

  return (
    <DashboardLayout>
      <div className="page-container ticket-page">
        <div className="card ticket-page-header">
          <div>
            <h1>Incident Tickets</h1>
            <p className="muted-text">
              {isAdmin
                ? 'Review new incidents, assign technicians, and track progress.'
                : isTechnician
                  ? 'Review your assigned tickets and reply with updates.'
                  : 'Raise issues and track ticket progress.'}
            </p>
          </div>

          {isAdmin && (
            <select className="text-input ticket-admin-filter" value={adminFilter} onChange={(event) => setAdminFilter(event.target.value)}>
              <option value="ALL">All Tickets</option>
              <option value="ASSIGNED">Assigned Tickets</option>
              <option value="REPLIED">Replied Tickets</option>
            </select>
          )}

          {user?.role === 'USER' && (
            <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
              Raise Ticket
            </button>
          )}
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="success-text">{success}</p> : null}

        {loading ? (
          <div className="card"><p className="muted-text">Loading tickets...</p></div>
        ) : sortedTickets.length === 0 ? (
          <div className="card"><p className="muted-text">No tickets found for your role.</p></div>
        ) : (
          <div className="ticket-list">
            {sortedTickets.map((ticket) => (
              <article key={ticket.id} className="card ticket-card">
                <div className="ticket-card-head">
                  <div>
                    <p className="ticket-id">Ticket #{ticket.id}</p>
                    <h3>{ticket.description}</h3>
                  </div>
                  <div className="ticket-badges">
                    <span className={`ticket-badge badge-status-${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                    <span className={`ticket-badge badge-priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                  </div>
                </div>

                <div className="ticket-meta-grid">
                  <p><strong>Location:</strong> {ticket.location}</p>
                  <p><strong>Category:</strong> {ticket.category}</p>
                  <p><strong>Raised By:</strong> {ticket.createdByName} ({ticket.createdByEmail})</p>
                  <p><strong>Assigned To:</strong> {ticket.assignedToName || 'Not assigned yet'}</p>
                  <p><strong>Contact:</strong> {ticket.contactEmail}{ticket.contactPhone ? ` | ${ticket.contactPhone}` : ''}</p>
                  <p><strong>Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
                </div>

                {ticket.attachments?.length > 0 && (
                  <div className="ticket-attachment-grid">
                    {ticket.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`data:${attachment.contentType};base64,${attachment.dataBase64}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ticket-attachment-item"
                      >
                        <img
                          src={`data:${attachment.contentType};base64,${attachment.dataBase64}`}
                          alt={attachment.fileName}
                        />
                        <p>{attachment.fileName}</p>
                      </a>
                    ))}
                  </div>
                )}

                <div className="ticket-actions-row">
                  {ticket.editableByRequester && user?.role === 'USER' && (
                    <button className="secondary-btn" onClick={() => openEditModal(ticket)}>Edit</button>
                  )}

                  {ticket.deletableByRequester && user?.role === 'USER' && (
                    <button className="secondary-btn" onClick={() => handleDeleteTicket(ticket.id)}>Delete</button>
                  )}

                  {isAdmin && !ticket.assignedToId && (
                    <>
                      <select
                        className="text-input"
                        value={technicianSelection[ticket.id] || ''}
                        onChange={(event) =>
                          setTechnicianSelection((prev) => ({
                            ...prev,
                            [ticket.id]: event.target.value
                          }))
                        }
                      >
                        <option value="">Select Technician</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name} ({tech.email})
                          </option>
                        ))}
                      </select>
                      <button className="primary-btn" onClick={() => handleAssignTicket(ticket.id)}>
                        Assign
                      </button>
                    </>
                  )}
                </div>

                <div className="ticket-replies">
                  <h4>Replies</h4>
                  {ticket.replies?.length ? (
                    <div className="ticket-reply-list">
                      {ticket.replies.map((reply) => (
                        <div key={reply.id} className="ticket-reply-item">
                          <p>
                            <strong>{reply.authorName}</strong> ({reply.authorRole})
                          </p>
                          <p>{reply.message}</p>
                          <small>{new Date(reply.createdAt).toLocaleString()}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-text">No replies yet.</p>
                  )}

                  {canReply(ticket) && (
                    <div className="ticket-reply-form">
                      <textarea
                        className="text-input"
                        rows={3}
                        placeholder="Write a reply..."
                        value={replyDrafts[ticket.id]?.message || ''}
                        onChange={(event) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [ticket.id]: {
                              ...prev[ticket.id],
                              message: event.target.value
                            }
                          }))
                        }
                      />

                      <div className="ticket-reply-actions">
                        <select
                          className="text-input"
                          value={replyDrafts[ticket.id]?.status || ''}
                          onChange={(event) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [ticket.id]: {
                                ...prev[ticket.id],
                                status: event.target.value
                              }
                            }))
                          }
                        >
                          <option value="">Keep status unchanged</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>

                        <button className="primary-btn" onClick={() => handleReply(ticket.id)}>
                          Post Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <TicketFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTicket}
        title="Raise Ticket"
        submitLabel="Submit Ticket"
        submitting={submitting}
        initialValues={createTicketInitialValues}
      />

      <TicketFormModal
        open={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        onSubmit={handleUpdateTicket}
        title="Update Ticket"
        submitLabel="Save Changes"
        submitting={submitting}
        initialValues={editingTicket}
      />
    </DashboardLayout>
  );
}

export default TicketsPage;
