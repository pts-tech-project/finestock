# FinStock Backend

Express + Sequelize API for authentication, users, and company profile.

## Setup

```bash
cd Back-End
npm install
cp .env.example .env
# fill DB + SMTP values in .env
npm run dev
```

## Environment

| Variable | Purpose |
|----------|---------|
| `DB_*` | MySQL connection |
| `JWT_SECRET` | Token signing |
| `EMAIL_PROVIDER` | `ethereal` (default free test mail) |
| `RESEND_API_KEY` | Free Resend key for real inbox delivery |
| `SMTP_*` | Optional custom SMTP |
| `FRONTEND_URL` | Login link in welcome emails |

**Email:** By default uses free [Ethereal Email](https://ethereal.email) (no signup). Create-user responses include a `previewUrl` to view the message. For real recipient inboxes, add a free [Resend](https://resend.com) API key.

## Auth & users

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/api/auth/login` | Public | `{ email, password }` → JWT + user |
| GET | `/api/auth/me` | Auth | Current user |
| POST | `/api/auth/register` | Owner/Manager | Creates user, emails password |
| GET | `/api/users` | Owner/Manager | List / filter users |
| POST | `/api/users` | Owner/Manager | Create user, emails password |
| PUT | `/api/users/:id` | Owner/Manager | Update user |
| PATCH | `/api/users/:id/deactivate` | Owner/Manager | Soft deactivate |
| POST | `/api/users/:id/reset-password` | Owner/Manager | New password emailed |

## Company

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/company` | Auth |
| PUT | `/api/company` | Owner/Manager |

## Roles & permissions

Matches the frontend Settings page matrix.

Permissions: `View Sales`, `Manage Inventory`, `Create Purchase`, `View Reports`, `Submit VAT`  
Roles: `Owner`, `Manager`, `Accountant`, `Staff`

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/api/roles` | Owner/Manager | Full matrix + permission list |
| GET | `/api/roles/permissions` | Owner/Manager | Permission names only |
| GET | `/api/roles/me` | Auth | Current user's permissions |
| GET | `/api/roles/:role` | Owner/Manager | One role's permission map |
| PUT | `/api/roles/:role` | Owner | Save permissions (`{ permissions: { ... } }`) |
| PUT | `/api/roles/:role/permissions` | Owner | Same as above |

Defaults are seeded on first startup (same as frontend `defaultPerms`).

Login / `GET /api/auth/me` also return `permissions` and `allowed` for the signed-in role.

## Bootstrap first Owner

With SMTP unset, create the first owner via a one-off script or MySQL after sync. Easiest path once the API is up:

```bash
node src/scripts/createOwner.js
```

Then log in with the credentials printed / emailed.
