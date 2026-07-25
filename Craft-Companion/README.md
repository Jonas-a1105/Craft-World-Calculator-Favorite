# Craftworld Companion (MVP)

Craftworld Companion is a full-stack MVP dashboard shell for Craft World player account data.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Auth: OAuth 2.0 Authorization Code with PKCE (S256)
- Storage: file-based JSON (`users.json`)

## Setup

```bash
npm install
```

## Run locally

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

## Environment variables

Copy `.env.example` to `.env` (and for server/client if desired).

### Required for OAuth

- `CRAFTWORLD_OAUTH_CLIENT_ID` — Public client identifier (provided by Craft World)
- `CRAFTWORLD_OAUTH_CLIENT_SECRET` — Secret for confidential clients (shown once at registration)
- `CRAFTWORLD_OAUTH_REDIRECT_URI` — Exact callback URL registered for your app
- `CRAFTWORLD_OAUTH_SCOPES` — Space-delimited scopes (default: `profile:read craft:read masterpiece:read`)

### Other server vars

- `PORT` — Server port (default 3001)
- `JWT_SECRET` — Secret for session signing (used as fallback)
- `DATA_DIR` — Directory for JSON storage (default `./data`)
- `CRAFTWORLD_BASE_URL` — Craft World base URL (default `https://craft-world.gg`)
- `CRAFTWORLD_EXTERNAL_API_BASE` — External API base (default `https://craft-world.gg/api/2/external`)
- `CLIENT_ORIGIN` / `FRONTEND_URL` — Client origin for CORS and redirects
- `SESSION_SECRET` — Session cookie signing secret
- `SESSION_MAX_AGE_SECONDS` — Session cookie max age (default 7 days)

### Client vars

- `VITE_API_BASE_URL` — API base URL (default `http://localhost:3001`)

## DATA_DIR and Render

User data is stored in:

- `${DATA_DIR}/users.json`

Default data dir:

- `process.env.DATA_DIR || "./data"`

On Render, attach a persistent disk at `/var/data` and set:

- `DATA_DIR=/var/data`

## OAuth Flow (Authorization Code + PKCE)

1. Generate PKCE `code_verifier` and `code_challenge` (S256) + random `state` in session storage
2. Redirect user to `/api/oauth/authorize` → Craft World consent screen
3. Callback `/api/oauth/callback?code=...&state=...` exchanges code for tokens
4. Store `access_token`, `refresh_token`, `expires_in`, `scope` in user record
5. Call External API with `Authorization: Bearer <access_token>`
6. Refresh tokens via `/api/oauth/token` (grant_type=refresh_token) — old refresh token is revoked
7. Logout via `/api/oauth/logout` (revokes refresh token)

## External API Scopes (current)

| Scope              | Endpoint               | Data                                          |
| ------------------ | ---------------------- | --------------------------------------------- |
| `profile:read`     | `GET /me/profile`      | uid, display name, avatar URL, level          |
| `craft:read`       | `GET /me/craft-world`  | level, resource balances                      |
| `masterpiece:read` | `GET /me/masterpieces` | claimed masterpiece IDs, active battle passes |

> Note: Dynos, factories, land plots, vaults, workshop, proficiencies, currencies, power, skill points, wallets, and quotes are **not available** via the current partner External API. Request additional scopes via Discord: https://discord.gg/AngryDynomites

## OpenAPI

Machine-readable contract: https://craft-world.gg/api/2/external/openapi.json

## Security requirements

- Always use PKCE with S256
- Validate `state` on every callback
- Use exact registered redirect URIs — no wildcards
- Store `client_secret` only on trusted server; never ship in browser or mobile binary
- Transmit tokens only over HTTPS
- Do not call first-party Craft World APIs with OAuth tokens — they will be rejected

## Checklist

- [ ] Received `client_id` (and secret if confidential)
- [ ] Redirect URI(s) and browser origin(s) registered
- [ ] Allowed scopes confirmed for your use case
- [ ] PKCE + state implemented on authorize
- [ ] Callback exchanges code within 60 seconds
- [ ] External API calls use Bearer tokens against `https://craft-world.gg/api/2/external` only
- [ ] Refresh rotation handled (store new refresh token each time)
- [ ] Revocation on disconnect / logout implemented
- [ ] OpenAPI imported from `https://craft-world.gg/api/2/external/openapi.json`

## Guía de Colaboración para Desarrolladores (Team Workflow)

### 1. Agregar un nuevo Colaborador en GitHub

1. Ingresar al repositorio en GitHub: `https://github.com/Jonas-a1105/Craft-World-Calculator-Favorite`
2. En las pestañas superiores, ir a **Settings** > **Collaborators**.
3. Hacer clic en el botón verde **Add people**.
4. Escribir el nombre de usuario de GitHub o correo electrónico del desarrollador y confirmar la invitación.

### 2. Configuración Inicial en la PC del Desarrollador

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jonas-a1105/Craft-World-Calculator-Favorite.git

# 2. Entrar al directorio del proyecto
cd Craft-World-Calculator-Favorite/Craft-Companion

# 3. Instalar dependencias
npm install
```

### 3. Flujo Diario de Trabajo en Git

#### A. Antes de empezar a programar (descargar actualizaciones):

```bash
git pull origin main
```

#### B. Ejecutar la aplicación en modo desarrollo local:

```bash
npm run dev
```

- Cliente Web (React + Vite): `http://localhost:5173`
- Servidor API (Node + Express): `http://localhost:3001`

#### C. Subir cambios al repositorio remoto:

```bash
git add .
git commit -m "Descripción clara de las mejoras realizadas"
git push origin main
```

---

## License

MIT
