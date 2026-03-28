# Smart Campus — Operations Hub

> Security and notification module for the Smart Campus Operations Hub (backend) and a minimal React frontend.

## Prerequisites
- Java 17 (set `JAVA_HOME`)
- Maven (`mvn`) on PATH
- Node.js (18+) and npm
- PostgreSQL running (defaults are below)

## Configuration
Edit or override values in `backend/src/main/resources/application.yml` or via environment variables.

Important env vars (examples shown for PowerShell):

```powershell
$env:DB_USERNAME = "smartcampus"
$env:DB_PASSWORD = "smartcampus"
$env:JWT_SECRET = "change-me"
$env:GOOGLE_CLIENT_ID = "your-google-client-id"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"
```

Default DB URL is `jdbc:postgresql://localhost:5432/smart_campus` (see [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml#L1)).

## Run Backend (development)

```powershell
cd backend
mvn spring-boot:run
```

Or build a jar and run:

```powershell
cd backend
mvn package
java -jar target/*.jar
```

Run backend tests:

```powershell
cd backend
mvn test
```

## Run Frontend (development)

```bash
cd frontend
npm install
npm run dev
```

Build frontend for production and preview:

```bash
cd frontend
npm run build
npm run preview
```

Frontend config and API helper: [frontend/src/api.js](frontend/src/api.js#L1) and package details in [frontend/package.json](frontend/package.json#L1).

## Ports
- Backend: `8080` (configurable in `application.yml`)
- Vite dev server: `5173` by default

## Troubleshooting
- If the backend fails to start, check that PostgreSQL is running and credentials match the env vars.
- For CORS/proxy during frontend development, add a dev proxy to `vite.config.js` or update `src/api.js` to point to the backend URL.

## Files of interest
- Maven config: [backend/pom.xml](backend/pom.xml#L1)
- Spring config: [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml#L1)
- Frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx#L1)

---
If you want, I can run the backend locally now and show the logs, or add a proxy config for the frontend.
