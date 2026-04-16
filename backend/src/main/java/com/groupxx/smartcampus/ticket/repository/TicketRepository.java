package com.groupxx.smartcampus.ticket.repository;

import com.groupxx.smartcampus.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByOrderByUpdatedAtDesc();

    List<Ticket> findByCreatedByIdOrderByUpdatedAtDesc(Long createdById);

    List<Ticket> findByAssignedToIdOrderByUpdatedAtDesc(Long assignedToId);
}
