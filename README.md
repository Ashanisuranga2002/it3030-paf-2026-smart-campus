# Smart Campus Operations Hub

Smart Campus Operations Hub is a full-stack web application for managing university resources, bookings, support tickets, user administration, and notifications.

## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Spring Boot 3 (Web, Security, OAuth2 Client, JPA, Validation)
- Database: MySQL (default), H2 (runtime dependency available)
- Authentication: JWT + Google OAuth2

## Core Features

- Google sign-in and email/password login
- Role-based access control (`ADMIN`, `TECHNICIAN`, `USER`)
- Resource management (admin CRUD)
- Booking workflow with admin approve/reject
- Ticket workflow with assignment and replies
- Notification center with unread count and mark-as-read actions
- Admin user management (create/update/delete users)
- Editable user profile

## Repository Structure

```text
.
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/groupxx/smartcampus/
│       ├── auth/
│       ├── booking/
│       ├── notification/
│       ├── resource/
│       ├── ticket/
│       └── user/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── utils/
├── docs/
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+ and npm
- MySQL 8+

## Environment Configuration

### Backend

Backend defaults are read from `backend/src/main/resources/application.yml`.
You can override values with environment variables.

Important variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_FRONTEND_URL`
- `MAIL_USERNAME` (optional)
- `MAIL_PASSWORD` (optional)

Example:

```bash
export DB_URL="jdbc:mysql://localhost:3306/smart_campus_dbnew?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="your_password"
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"
export APP_FRONTEND_URL="http://localhost:5173"
```

### Frontend

Create/update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Run Locally

### 1. Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on:

- `http://localhost:8080`

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default:

- `http://localhost:5173`

Note: If port `5173` is busy, Vite automatically picks another port (for example `5174`).

## Build

### Backend

```bash
cd backend
mvn -DskipTests compile
```

### Frontend

```bash
cd frontend
npm run build
```

## Authentication and Authorization

- JWT token is attached to requests by frontend Axios interceptor.
- Backend validates JWT with `JwtAuthenticationFilter`.
- Route-level protection on frontend is handled by `ProtectedRoute`.
- Method and endpoint authorization on backend is enforced by Spring Security config and `@PreAuthorize`.

## API Overview

Auth:

- `GET /api/auth/login-url`
- `POST /api/auth/login/password`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PUT /api/auth/me`

Notifications:

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all`

Admin User Management:

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/{id}`
- `DELETE /api/admin/users/{id}`

## Team Branch Strategy

- `main`: stable release
- `develop`: integration branch
- feature/member branches for module work

## Troubleshooting

### Backend port already in use

If `8080` is already occupied:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Stop the process using that port, or change server port.

### Frontend points to wrong API

Check `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Restart frontend after changing `.env`.

## Notes

- `docker-compose.yml` currently exists as a placeholder and is not configured yet.
- For production, replace all default credentials/secrets with secure environment-managed values.
