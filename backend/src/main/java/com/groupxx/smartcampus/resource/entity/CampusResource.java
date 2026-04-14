package com.groupxx.smartcampus.resource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampusResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 1000)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ResourceStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
