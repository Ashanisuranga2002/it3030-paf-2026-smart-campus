package com.groupxx.smartcampus.ticket.controller;

import com.groupxx.smartcampus.ticket.dto.*;
import com.groupxx.smartcampus.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTickets(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketById(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketCreateRequest request,
                                                       Authentication authentication) {
        return ResponseEntity.ok(ticketService.createTicket(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable Long id,
                                                       @Valid @RequestBody TicketUpdateRequest request,
                                                       Authentication authentication) {
        return ResponseEntity.ok(ticketService.updateTicket(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id, Authentication authentication) {
        ticketService.deleteTicket(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTicket(@PathVariable Long id,
                                                       @Valid @RequestBody TicketAssignRequest request,
                                                       Authentication authentication) {
        return ResponseEntity.ok(ticketService.assignTicket(authentication.getName(), id, request));
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<TicketResponse> addReply(@PathVariable Long id,
                                                   @Valid @RequestBody TicketReplyCreateRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(ticketService.addReply(authentication.getName(), id, request));
    }
}
