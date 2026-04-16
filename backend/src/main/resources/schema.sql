CREATE DATABASE IF NOT EXISTS smart_campus_db;
USE smart_campus_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    profile_picture VARCHAR(500),
    role VARCHAR(50) NOT NULL,
    active BIT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    reference_type VARCHAR(100),
    reference_id BIGINT,
    is_read BIT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS resources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    capacity INT,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    attendees_count INT,
    status VARCHAR(50) NOT NULL,
    rejection_reason VARCHAR(255),
    removal_reason VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_resource FOREIGN KEY (resource_id) REFERENCES resources(id)
);

CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    assigned_to BIGINT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(30),
    resolution_notes TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_tickets_user FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_tickets_assigned_user FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    data_base64 LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_ticket_attachments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS ticket_replies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_ticket_replies_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    CONSTRAINT fk_ticket_replies_author FOREIGN KEY (author_id) REFERENCES users(id)
);
