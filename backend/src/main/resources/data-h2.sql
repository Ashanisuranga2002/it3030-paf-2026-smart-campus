-- Seed data adapted from Dump20260414.sql for local H2 profile.
DELETE FROM ticket_replies;
DELETE FROM ticket_attachments;
DELETE FROM tickets;
DELETE FROM notifications;
DELETE FROM users;

INSERT INTO users (id, active, created_at, email, name, profile_picture, role, updated_at, password_hash) VALUES
(2, FALSE, '2026-04-12 19:24:25.951815', 'otpflow@testmail.com', 'Test User', NULL, 'USER', '2026-04-12 19:24:25.951824', '$2a$10$5FBCCJoxyN/WT9bt7fuLn.w4qxS2jZl/ZbUcogtncaG1lWCEeN47q'),
(3, FALSE, '2026-04-12 19:26:01.868520', 'ashanisuranga360@gmail.com', 'Ashan', NULL, 'ADMIN', '2026-04-12 19:26:01.868540', '$2a$10$MsYMmaFK3xnlQVhcm/FGb.sgklzmRbdqbSlGrT1GC5Dhno0goBili'),
(4, FALSE, '2026-04-12 19:41:19.521732', 'directlogin@testmail.com', 'Direct Login User', NULL, 'ADMIN', '2026-04-12 19:41:19.521757', '$2a$10$6wJ89hyHTXuuLfk43dyjS.0u6SFQKSD8sLJB20qpsvJROGhZ7ppH2'),
(6, FALSE, '2026-04-12 20:09:33.592380', 'itachix245@gmail.com', 'Itachi Uchiha', 'https://lh3.googleusercontent.com/a/ACg8ocL8wZWJhqdKe7hWPqzqxh2xLMw3uwEQCvHKMzMNuY8uhTbSvw=s96-c', 'USER', '2026-04-12 20:09:33.592417', NULL),
(7, FALSE, '2026-04-12 20:23:15.191162', 'it23716650@my.sliit.lk', 'it23716650 WICKRAMAARACHCHI W A A I', 'https://lh3.googleusercontent.com/a/ACg8ocKcSsbmnUNdiRruC2EojN73ibwIxD0fmuwbC9b-18k8pHh6pQ=s96-c', 'USER', '2026-04-12 20:23:15.191178', NULL);

INSERT INTO notifications (id, created_at, is_read, message, reference_id, reference_type, title, type, user_id) VALUES
(1, '2026-04-12 20:06:18.760542', FALSE, 'Admin directlogin@testmail.com updated user cruduser@testmail.com', 5, 'USER', 'User Updated', 'USER_UPDATED', 4),
(2, '2026-04-12 20:06:18.781843', FALSE, 'Admin directlogin@testmail.com deleted user cruduser@testmail.com', 5, 'USER', 'User Deleted', 'USER_DELETED', 4),
(3, '2026-04-12 20:35:51.399343', FALSE, 'Admin ashanisuranga360@gmail.com deleted user avanthawickramaachchi@gmil.com', 1, 'USER', 'User Deleted', 'USER_DELETED', 3),
(4, '2026-04-12 20:35:51.402216', FALSE, 'Admin ashanisuranga360@gmail.com deleted user avanthawickramaachchi@gmil.com', 1, 'USER', 'User Deleted', 'USER_DELETED', 4);

ALTER TABLE users ALTER COLUMN id RESTART WITH 8;
ALTER TABLE notifications ALTER COLUMN id RESTART WITH 5;
