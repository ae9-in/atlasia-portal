# Student Daily Reporting System

Production-ready SaaS platform for daily student task reporting with secure authentication, ZIP-only report uploads, task assignment, submission tracking, and admin analytics.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, TanStack Query, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, Multer
- Security: JWT, HTTP-only cookies, bcrypt, Helmet, CORS, rate limiting, mongo-sanitize
- Deployment: environment-based local and production Node builds

## Features

- Student registration and login
- Role-based student and admin dashboards
- ZIP-only report uploads with 20MB limit
- One report submission per student per day
- Public task board on landing page
- Admin task creation and deletion
- Student activation and deactivation
- Daily submission tracker and weekly analytics charts
- Toast notifications, drag-and-drop uploads, dark mode toggle, responsive UI

## Project Structure

```text
student-reporting-platform/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
  frontend/
    src/
      animations/
      assets/
      components/
      hooks/
      layouts/
      pages/
      services/
      store/
      utils/
  uploads/
    reports/
  .env.example
  README.md
```

## Backend Environment

Use [backend/.env](w:/V%20S%20Code%20files/project-student-dtr/backend/.env) for backend runtime configuration.

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/student-reporting
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
COOKIE_SECRET=replace_with_cookie_secret
MAX_FILE_SIZE_MB=20
SEED_ADMIN=false
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

If you want the backend to create an admin account automatically, set:

```env
SEED_ADMIN=true
ADMIN_NAME=Platform Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong_password_here
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start MongoDB locally

Make sure MongoDB is running on `127.0.0.1:27017`.

If MongoDB is installed as a Windows service, start it from Services or run:

```powershell
net start MongoDB
```

If your MongoDB service name is different, use that service name instead.

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Production Build

```bash
npm run build
```

- Frontend build output: `frontend/dist`
- Backend runs directly with Node via `npm run start`

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Reports

- `POST /api/reports/upload`
- `GET /api/reports/my-reports`
- `GET /api/reports/all`
- `GET /api/reports/status`
- `GET /api/reports/download/:filename`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `DELETE /api/tasks/:id`

### Admin

- `GET /api/admin/students`
- `PATCH /api/admin/students/:id/toggle-status`

## Security Notes

- JWT tokens are stored in HTTP-only cookies
- Passwords are hashed with bcrypt
- Student downloads are restricted to their own reports
- Duplicate same-day uploads are rejected and cleaned up
- Helmet, CORS, compression, rate limiting, and mongo-sanitize are enabled

## Notes

- Optional email notifications and realtime updates are not implemented.
- Your current backend startup error means MongoDB is not running at `127.0.0.1:27017`.
