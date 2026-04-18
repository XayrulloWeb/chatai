# Full Deploy Guide (Netlify + Backend)

Date checked: April 18, 2026.

## What works in production

- Frontend (`React + Vite`) on Netlify.
- Backend (`backend/server.js`) on a separate host: Render / Railway / Fly.
- Database: PostgreSQL (recommended for production).

## 1. Local preparation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Verify production build:
   ```bash
   npm run build
   ```
3. Confirm these files exist:
   - `netlify.toml` (build + SPA redirect)
   - `.env.example` (frontend and backend env examples)

## 2. Deploy backend (Render recommended)

## 2.1 Create PostgreSQL

Any managed PostgreSQL is fine (Render Postgres, Neon, Supabase).  
You need a working `DATABASE_URL`.

## 2.2 Create a Render Web Service

1. Render -> `New` -> `Web Service`.
2. Connect your GitHub repository.
3. Configure:
   - `Build Command`: `npm ci`
   - `Start Command`: `npm run server`
   - `Health Check Path`: `/health`
4. Add environment variables:
   - `AUTH_TOKEN_SECRET` = long random secret
   - `AUTH_TOKEN_TTL_SECONDS` = `604800`
   - `AUTH_CORS_ORIGIN` = `https://YOUR_NETLIFY_SITE.netlify.app`
   - `DATABASE_URL` = your PostgreSQL URL
   - `DATABASE_SSL` = `true` (typical for managed DBs)
   - `DATABASE_AUTO_CREATE` = `true`
   - `MIGRATE_FILE_DATA` = `true`

Backend URL will look like:
`https://your-backend.onrender.com`

Health check:
```bash
curl https://your-backend.onrender.com/health
```
Expected: JSON with `ok: true`.

## 3. Deploy frontend on Netlify

1. Netlify -> `Add new site` -> `Import an existing project`.
2. Select your repository.
3. Build settings:
   - `Build command`: `npm run build`
   - `Publish directory`: `dist`
4. In `Site configuration -> Environment variables`, set:
   - `VITE_AUTH_API_URL` = `https://your-backend.onrender.com`
   - `VITE_AI_PROVIDER` = `demo`

Important:
- Do not put production secrets into `VITE_OPENAI_API_KEY` or `VITE_GEMINI_API_KEY`.
- `netlify.toml` already includes SPA redirect (`/* -> /index.html`) for React routes.

## 4. Frontend-backend connection check

1. Open your Netlify frontend URL.
2. Register/login a user.
3. If you get CORS errors:
   - Check `AUTH_CORS_ORIGIN` in Render.
   - Use the exact Netlify domain, no extra slash.

## 5. Updates

1. Push code to GitHub.
2. Netlify and Render redeploy automatically (if auto deploy is enabled).
3. If env vars change, redeploy both services.

## 6. Quick checklist

- Backend `/health` responds.
- Netlify has correct `VITE_AUTH_API_URL`.
- Render has correct `AUTH_CORS_ORIGIN`.
- Production uses PostgreSQL.
