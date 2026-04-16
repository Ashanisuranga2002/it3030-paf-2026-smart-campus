package com.groupxx.smartcampus.ticket.service;

import com.groupxx.smartcampus.auth.entity.RoleType;
import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.repository.UserRepository;
import com.groupxx.smartcampus.common.exception.BadRequestException;
import com.groupxx.smartcampus.common.exception.ForbiddenException;
import com.groupxx.smartcampus.common.exception.ResourceNotFoundException;
import com.groupxx.smartcampus.notification.entity.NotificationType;
import com.groupxx.smartcampus.notification.service.NotificationService;
import com.groupxx.smartcampus.ticket.dto.*;
import com.groupxx.smartcampus.ticket.entity.*;
import com.groupxx.smartcampus.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private static final int MAX_ATTACHMENTS = 5;
    private static final int MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<TicketResponse> getTickets(String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);

        List<Ticket> tickets;
        if (requester.getRole() == RoleType.ADMIN) {
            tickets = ticketRepository.findAllByOrderByUpdatedAtDesc();
        } else if (requester.getRole() == RoleType.TECHNICIAN) {
            tickets = ticketRepository.findByAssignedToIdOrderByUpdatedAtDesc(requester.getId());
        } else {
            tickets = ticketRepository.findByCreatedByIdOrderByUpdatedAtDesc(requester.getId());
        }

        return tickets.stream()
                .map(ticket -> toResponse(ticket, requester))
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long ticketId, String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);
        Ticket ticket = getTicketById(ticketId);
        ensureCanView(ticket, requester);
        return toResponse(ticket, requester);
    }

    @Transactional
    public TicketResponse createTicket(String requesterEmail, TicketCreateRequest request) {
        User requester = getUserByEmail(requesterEmail);

        Ticket ticket = new Ticket();
        ticket.setCreatedBy(requester);
        ticket.setAssignedTo(null);
        ticket.setDescription(request.getDescription().trim());
        ticket.setLocation(request.getLocation().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setContactEmail(request.getContactEmail().trim().toLowerCase());
        ticket.setContactPhone(normalizeOptional(request.getContactPhone()));
        ticket.setResolutionNotes(null);

        List<TicketAttachment> mappedAttachments = mapAttachments(request.getAttachments(), ticket);
        ticket.getAttachments().clear();
        ticket.getAttachments().addAll(mappedAttachments);

        Ticket saved = ticketRepository.save(ticket);

        notificationService.createNotificationForRole(
                RoleType.ADMIN,
                NotificationType.ADMIN_ALERT,
                "New Ticket Raised",
                requester.getName() + " raised ticket #" + saved.getId(),
                "TICKET",
                saved.getId()
        );

        return toResponse(saved, requester);
    }

    @Transactional
    public TicketResponse updateTicket(String requesterEmail, Long ticketId, TicketUpdateRequest request) {
        User requester = getUserByEmail(requesterEmail);
        Ticket ticket = getTicketById(ticketId);

        ensureCanRequesterModifyOrDelete(ticket, requester);

        ticket.setDescription(request.getDescription().trim());
        ticket.setLocation(request.getLocation().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setPriority(request.getPriority());
        ticket.setContactEmail(request.getContactEmail().trim().toLowerCase());
        ticket.setContactPhone(normalizeOptional(request.getContactPhone()));

        if (request.getAttachments() != null) {
            List<TicketAttachment> mappedAttachments = mapAttachments(request.getAttachments(), ticket);
            ticket.getAttachments().clear();
            ticket.getAttachments().addAll(mappedAttachments);
        }

        return toResponse(ticketRepository.save(ticket), requester);
    }

    @Transactional
    public void deleteTicket(String requesterEmail, Long ticketId) {
        User requester = getUserByEmail(requesterEmail);
        Ticket ticket = getTicketById(ticketId);

        ensureCanRequesterModifyOrDelete(ticket, requester);
        ticketRepository.delete(ticket);
    }

    @Transactional
    public TicketResponse assignTicket(String requesterEmail, Long ticketId, TicketAssignRequest request) {
        User requester = getUserByEmail(requesterEmail);
        if (requester.getRole() != RoleType.ADMIN) {
            throw new ForbiddenException("Only admins can assign tickets to technicians");
        }

        Ticket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        if (technician.getRole() != RoleType.TECHNICIAN) {
            throw new BadRequestException("Selected user is not a technician");
        }

        ticket.setAssignedTo(technician);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.createNotification(
                technician.getEmail(),
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Assigned",
                "Ticket #" + ticket.getId() + " has been assigned to you",
                "TICKET",
                ticket.getId()
        );

        return toResponse(saved, requester);
    }

    @Transactional
    public TicketResponse addReply(String requesterEmail, Long ticketId, TicketReplyCreateRequest request) {
        User requester = getUserByEmail(requesterEmail);
        Ticket ticket = getTicketById(ticketId);

        boolean isAdmin = requester.getRole() == RoleType.ADMIN;
        boolean isAssignedTechnician = requester.getRole() == RoleType.TECHNICIAN
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(requester.getId());

        if (!isAdmin && !isAssignedTechnician) {
            throw new ForbiddenException("Only admins and the assigned technician can reply to this ticket");
        }

        TicketReply reply = new TicketReply();
        reply.setTicket(ticket);
        reply.setAuthor(requester);
        reply.setAuthorRole(requester.getRole());
        reply.setMessage(request.getMessage().trim());
        ticket.getReplies().add(reply);

        if (request.getStatus() != null) {
            if (request.getStatus() == TicketStatus.OPEN) {
                throw new BadRequestException("Ticket status cannot be set back to OPEN from replies");
            }
            if (request.getStatus() == TicketStatus.ASSIGNED && ticket.getAssignedTo() == null) {
                throw new BadRequestException("Ticket must be assigned before setting ASSIGNED status");
            }
            ticket.setStatus(request.getStatus());
            if (request.getStatus() == TicketStatus.RESOLVED) {
                ticket.setResolutionNotes(request.getMessage().trim());
            }
        }

        Ticket saved = ticketRepository.save(ticket);

        if (requester.getRole() == RoleType.TECHNICIAN) {
            notificationService.createNotificationForRole(
                    RoleType.ADMIN,
                    NotificationType.NEW_TICKET_COMMENT,
                    "Technician Reply Added",
                    requester.getName() + " replied to ticket #" + ticket.getId(),
                    "TICKET",
                    ticket.getId()
            );
        } else if (ticket.getAssignedTo() != null) {
            notificationService.createNotification(
                    ticket.getAssignedTo().getEmail(),
                    NotificationType.NEW_TICKET_COMMENT,
                    "Admin Reply Added",
                    requester.getName() + " replied to ticket #" + ticket.getId(),
                    "TICKET",
                    ticket.getId()
            );
        }

        return toResponse(saved, requester);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Ticket getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    private void ensureCanView(Ticket ticket, User requester) {
        if (requester.getRole() == RoleType.ADMIN) {
            return;
        }

        if (requester.getRole() == RoleType.TECHNICIAN
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(requester.getId())) {
            return;
        }

        if (ticket.getCreatedBy().getId().equals(requester.getId())) {
            return;
        }

        throw new ForbiddenException("You do not have access to this ticket");
    }

    private void ensureCanRequesterModifyOrDelete(Ticket ticket, User requester) {
        if (!ticket.getCreatedBy().getId().equals(requester.getId())) {
            throw new ForbiddenException("You can only modify your own ticket");
        }

        if (ticket.getAssignedTo() != null) {
            throw new BadRequestException("You cannot update or delete this ticket after admin assignment");
        }
    }

    private List<TicketAttachment> mapAttachments(List<TicketAttachmentRequest> requests, Ticket ticket) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }

        if (requests.size() > MAX_ATTACHMENTS) {
            throw new BadRequestException("You can upload up to " + MAX_ATTACHMENTS + " images per ticket");
        }

        return requests.stream().map(req -> {
            if (req.getContentType() == null || !req.getContentType().toLowerCase().startsWith("image/")) {
                throw new BadRequestException("Only image attachments are allowed");
            }

            String normalizedBase64 = normalizeBase64(req.getDataBase64());
            byte[] rawBytes;
            try {
                rawBytes = Base64.getDecoder().decode(normalizedBase64);
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Invalid attachment data for file: " + req.getFileName());
            }

            if (rawBytes.length > MAX_ATTACHMENT_BYTES) {
                throw new BadRequestException("Attachment exceeds 10MB limit: " + req.getFileName());
            }

            TicketAttachment attachment = new TicketAttachment();
            attachment.setTicket(ticket);
            attachment.setFileName(req.getFileName().trim());
            attachment.setContentType(req.getContentType().trim());
            attachment.setDataBase64(normalizedBase64);
            return attachment;
        }).toList();
    }

    private String normalizeBase64(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }

        String trimmed = value.trim();
        int commaIndex = trimmed.indexOf(',');
        if (trimmed.startsWith("data:") && commaIndex > -1) {
            return trimmed.substring(commaIndex + 1);
        }
        return trimmed;
    }

    private TicketResponse toResponse(Ticket ticket, User requester) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setCreatedById(ticket.getCreatedBy().getId());
        response.setCreatedByName(ticket.getCreatedBy().getName());
        response.setCreatedByEmail(ticket.getCreatedBy().getEmail());
        response.setAssignedToId(ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getId());
        response.setAssignedToName(ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getName());
        response.setAssignedToEmail(ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getEmail());
        response.setDescription(ticket.getDescription());
        response.setLocation(ticket.getLocation());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setContactEmail(ticket.getContactEmail());
        response.setContactPhone(ticket.getContactPhone());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        boolean isOwner = ticket.getCreatedBy().getId().equals(requester.getId());
        boolean canRequesterEditDelete = isOwner && ticket.getAssignedTo() == null;
        response.setEditableByRequester(canRequesterEditDelete);
        response.setDeletableByRequester(canRequesterEditDelete);

        response.setAttachments(ticket.getAttachments().stream().map(attachment -> {
            TicketAttachmentResponse attachmentResponse = new TicketAttachmentResponse();
            attachmentResponse.setId(attachment.getId());
            attachmentResponse.setFileName(attachment.getFileName());
            attachmentResponse.setContentType(attachment.getContentType());
            attachmentResponse.setDataBase64(attachment.getDataBase64());
            return attachmentResponse;
        }).toList());

        response.setReplies(ticket.getReplies().stream()
                .sorted(Comparator.comparing(TicketReply::getCreatedAt))
                .map(reply -> {
                    TicketReplyResponse replyResponse = new TicketReplyResponse();
                    replyResponse.setId(reply.getId());
                    replyResponse.setAuthorId(reply.getAuthor().getId());
                    replyResponse.setAuthorName(reply.getAuthor().getName());
                    replyResponse.setAuthorRole(reply.getAuthorRole());
                    replyResponse.setMessage(reply.getMessage());
                    replyResponse.setCreatedAt(reply.getCreatedAt());
                    return replyResponse;
                })
                .toList());

        return response;
    }

    private String normalizeEmail(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        return value.trim();
    }
}
