# Smart Campus Notifications Frontend

React + Vite single-page UI for member 4 scope (notifications and auth handoff).

## Prereqs
- Node.js 18+

## Setup
```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_BASE if backend not on http://localhost:8080
```

## Run dev server
```bash
npm run dev
```
Open the shown localhost URL (default 5173).

## Build
```bash
npm run build
npm run preview
```

## Using the app
- Sign-in: click **Start Google OAuth** to go through backend `/oauth2/authorization/google` (backend success handler should return tokens). Alternatively paste tokens manually in the panel and click **Save tokens**.
- Notifications: loads `/api/notifications`, unread count, mark read, and delete.
- Refresh token: 401 responses auto-trigger `/api/auth/refresh` if a refresh token is stored.

## Notes
- Tokens are kept in `localStorage` for simplicity. For production, consider HTTP-only cookies for refresh tokens.
- Update backend CORS to allow `http://localhost:5173` if needed.
