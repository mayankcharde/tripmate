# TripMate Authentication

Standalone Node.js, Express, and MongoDB authentication API for TripMate.

## Setup

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
3. Install dependencies and start the API:

```powershell
npm install
npm run dev
```

The API listens on `http://localhost:4000` by default. The React app expects this URL through `VITE_AUTH_API_URL`.

## Endpoints

- `POST /api/auth/register` creates a user and sets an HTTP-only session cookie.
- `POST /api/auth/login` signs a user in.
- `GET /api/auth/me` returns the current session user.
- `POST /api/auth/logout` clears the session cookie.
- `GET /health` checks service availability.

Passwords are hashed with bcrypt and are never returned by the API. In production, serve the frontend and API over HTTPS and set `CLIENT_ORIGIN` to the exact frontend origin.
