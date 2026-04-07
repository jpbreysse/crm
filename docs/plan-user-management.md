# Plan: User Management with Better Auth

## Context

Add login and role-based access control to Energy CRM using [Better Auth](https://better-auth.com) with the Drizzle adapter. Two roles: **admin** (manage users, see everything) and **sales** (see only their own deals and activities).

### Tech Choice: Better Auth

- Native Drizzle adapter — uses our existing PostgreSQL database
- SvelteKit handler — plugs into `hooks.server.ts`
- Email/password authentication built-in
- Admin plugin for role management (admin, sales)
- Session stored in PostgreSQL (cookie-based)

---

## Phase 1: Install & Configure Better Auth

### 1.1 Install package

```bash
npm install better-auth
```

### 1.2 Environment variables

Add to `.env` and `.env.example`:

```
BETTER_AUTH_SECRET=<32+ character random secret>
BETTER_AUTH_URL=http://localhost:5174
```

Generate secret with: `openssl rand -base64 32`

On Scalingo, set these via `scalingo --app crmenergy env-set BETTER_AUTH_SECRET=... BETTER_AUTH_URL=https://crmenergy.osc-fr1.scalingo.io`

### 1.3 Create auth server instance

**New file: `src/lib/server/auth.ts`**

- Import `betterAuth` from `better-auth`
- Import `drizzleAdapter` from `better-auth/adapters/drizzle`
- Import `admin` plugin from `better-auth/plugins`
- Import `sveltekitCookies` from `better-auth/svelte-kit`
- Use our existing `db` instance with `provider: "pg"`
- Enable `emailAndPassword: { enabled: true }`
- Add `admin()` plugin for role management
- Add `sveltekitCookies()` for proper cookie handling in SvelteKit

### 1.4 Create auth client

**New file: `src/lib/auth-client.ts`**

- Import `createAuthClient` from `better-auth/svelte`
- Import `adminClient` from `better-auth/client/plugins`
- Set `baseURL` to app URL
- Export client for use in Svelte components

---

## Phase 2: Database Schema Changes

### 2.1 Update Drizzle schema

**Modify: `src/lib/server/db/schema.ts`**

Better Auth requires 4 tables. Our existing `users` table will be adapted:

#### Extend `user` table (currently `users`)
| Column | Type | Notes |
|--------|------|-------|
| `emailVerified` | `boolean` | Required by Better Auth |
| `image` | `text` | Nullable, for avatar URL |
| `role` | `text` | Default `"user"`, added by admin plugin |
| `banned` | `boolean` | Added by admin plugin |
| `banReason` | `text` | Added by admin plugin |
| `banExpires` | `timestamp` | Added by admin plugin |
| `updatedAt` | `timestamp` | Required by Better Auth |

Use `usePlural: true` in the Drizzle adapter config so our table named `users` maps to Better Auth's `user` model.

#### New table: `session`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `expiresAt` | `timestamp` | NOT NULL |
| `token` | `text` | UNIQUE, NOT NULL |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |
| `ipAddress` | `text` | nullable |
| `userAgent` | `text` | nullable |
| `userId` | `text` | FK → user.id, CASCADE DELETE |

#### New table: `account`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `accountId` | `text` | NOT NULL |
| `providerId` | `text` | NOT NULL |
| `userId` | `text` | FK → user.id, CASCADE DELETE |
| `accessToken` | `text` | nullable |
| `refreshToken` | `text` | nullable |
| `idToken` | `text` | nullable |
| `accessTokenExpiresAt` | `timestamp` | nullable |
| `refreshTokenExpiresAt` | `timestamp` | nullable |
| `scope` | `text` | nullable |
| `password` | `text` | nullable (hashed password stored here) |
| `createdAt` | `timestamp` | NOT NULL |
| `updatedAt` | `timestamp` | NOT NULL |

#### New table: `verification`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `identifier` | `text` | NOT NULL |
| `value` | `text` | NOT NULL |
| `expiresAt` | `timestamp` | NOT NULL |
| `createdAt` | `timestamp` | nullable |
| `updatedAt` | `timestamp` | nullable |

### 2.2 Generate and apply

```bash
npx @better-auth/cli generate    # Generate exact schema from config
npm run db:push                   # Push to local database
```

### 2.3 Create migration file

**New file: `db/migrations/003_auth_tables.sql`**

SQL to create `session`, `account`, `verification` tables and add new columns to `users`.

---

## Phase 3: SvelteKit Integration

### 3.1 Auth middleware

**New file: `src/hooks.server.ts`**

On every request:
1. Call `auth.api.getSession({ headers: event.request.headers })`
2. If session exists, set `event.locals.user` and `event.locals.session`
3. Pass to `svelteKitHandler` to handle `/api/auth/*` routes

### 3.2 Type definitions

**Modify: `src/app.d.ts`**

```typescript
declare global {
    namespace App {
        interface Locals {
            user: {
                id: string;
                name: string;
                email: string;
                role: string;
            } | null;
            session: { id: string; expiresAt: Date } | null;
        }
    }
}
```

### 3.3 Route groups

Reorganize routes into two groups:

```
src/routes/
├── (auth)/                    # Public — no sidebar, no auth required
│   ├── +layout.svelte         # Minimal centered layout
│   ├── login/+page.svelte     # Login form
│   └── register/+page.svelte  # Registration form
├── (app)/                     # Protected — requires login
│   ├── +layout.server.ts      # Auth guard: redirect to /login if no user
│   ├── +layout.svelte         # Sidebar layout with user name + logout
│   ├── dashboard/             # (moved from root)
│   ├── companies/             # (moved from root)
│   ├── contacts/              # (moved from root)
│   ├── deals/                 # (moved from root)
│   ├── activities/            # (moved from root)
│   └── admin/                 # New: user management (admin only)
└── +page.svelte               # Redirect to /dashboard
```

### 3.4 Login page

**New file: `src/routes/(auth)/login/+page.svelte`**

- Email + password form
- Calls `authClient.signIn.email()`
- On success, redirects to `/dashboard`
- Link to register page (if allowed)
- Error display for invalid credentials

### 3.5 Register page

**New file: `src/routes/(auth)/register/+page.svelte`**

- Name + email + password form
- Calls `authClient.signUp.email()`
- On success, redirects to `/dashboard`
- Option: Only allow registration if no users exist (first admin) or if invited by admin

### 3.6 Auth layout

**New file: `src/routes/(auth)/+layout.svelte`**

- Centered card layout, no sidebar
- App name at top
- Clean, minimal design

### 3.7 Protected layout

**New file: `src/routes/(app)/+layout.server.ts`**

```typescript
// Redirect to /login if not authenticated
if (!locals.user) throw redirect(303, '/login');
return { user: locals.user };
```

**Modify: `src/routes/(app)/+layout.svelte`**

- Same sidebar layout as current `+layout.svelte`
- Pass `data.user` to sidebar component
- Show user name and logout button in sidebar

---

## Phase 4: Role-Based Access

### 4.1 Admin page

**New files: `src/routes/(app)/admin/+page.server.ts` and `+page.svelte`**

- Guard: if `locals.user.role !== 'admin'`, redirect to `/dashboard`
- List all users with roles
- Create new users (name, email, password, role)
- Ban/unban users

### 4.2 Sidebar changes

**Modify: `src/lib/components/app-sidebar.svelte`**

- Show "Admin" nav item only for admin users
- Display current user name at bottom
- Add logout button

### 4.3 Sales role restrictions

**Modify: deal and activity `+page.server.ts` files**

- Admin: sees all deals and activities
- Sales: `WHERE deals.owner_id = locals.user.id` filter
- Sales: activities filtered to contacts/deals they own

### 4.4 Auto-assign current user

**Modify: create actions in `+page.server.ts` files**

- Activities: set `userId` from `locals.user.id`
- Deals: set `ownerId` from `locals.user.id`
- Display user name in activity timeline

---

## Phase 5: Seed First Admin User

### Option A: Seed script

**New file: `db/seed-admin.ts`**

```bash
npx tsx db/seed-admin.ts
```

Creates the first admin user with a given email/password.

### Option B: Open registration for first user

If no users exist in the database, allow anyone to register (they become admin). After the first user is created, registration requires admin access.

**Recommendation**: Use Option B — simpler, no separate script needed.

---

## Files Summary

### New files (13)
| File | Purpose |
|------|---------|
| `src/lib/server/auth.ts` | Better Auth server instance |
| `src/lib/auth-client.ts` | Better Auth client for Svelte |
| `src/hooks.server.ts` | Auth middleware |
| `src/routes/(auth)/+layout.svelte` | Auth pages layout (no sidebar) |
| `src/routes/(auth)/login/+page.svelte` | Login page |
| `src/routes/(auth)/register/+page.svelte` | Register page |
| `src/routes/(app)/+layout.server.ts` | Auth guard |
| `src/routes/(app)/+layout.svelte` | App layout with user context |
| `src/routes/(app)/admin/+page.server.ts` | User management server |
| `src/routes/(app)/admin/+page.svelte` | User management UI |
| `db/migrations/003_auth_tables.sql` | Auth schema migration |
| `db/seed-admin.ts` | Seed script (optional) |
| `docs/plan-user-management.md` | This document |

### Modified files (8+)
| File | Change |
|------|--------|
| `src/lib/server/db/schema.ts` | Add auth tables, extend user table |
| `src/app.d.ts` | Add `Locals` types |
| `src/lib/components/app-sidebar.svelte` | User name, logout, admin link |
| `.env` / `.env.example` | Add auth env vars |
| `package.json` | Add seed script |
| All `+page.server.ts` in routes | Use `locals.user` for ownership |

### Moved files
All routes under `src/routes/` (dashboard, companies, contacts, deals, activities) move into `src/routes/(app)/`.

---

## Deployment Checklist (Scalingo)

1. Set environment variables:
   ```bash
   scalingo --app crmenergy env-set BETTER_AUTH_SECRET=<secret>
   scalingo --app crmenergy env-set BETTER_AUTH_URL=https://crmenergy.osc-fr1.scalingo.io
   ```
2. Open db-tunnel and push schema:
   ```bash
   scalingo --app crmenergy db-tunnel -i ~/.ssh/id_ed25519 SCALINGO_POSTGRESQL_URL
   # In another terminal:
   ./db/migrate.sh "postgres://...@127.0.0.1:10000/..." 003
   ```
3. Push code to GitHub (auto-deploys or manual trigger)
4. Open the app — register first admin user
5. Create sales users from admin panel

---

## Verification

- [ ] Register first admin user (when no users exist)
- [ ] Login/logout flow works
- [ ] Unauthenticated users redirected to `/login`
- [ ] Admin can access `/admin` and create sales users
- [ ] Sales user cannot access `/admin`
- [ ] Sales user only sees their own deals
- [ ] Activities auto-assigned to logged-in user
- [ ] User name displayed in sidebar
- [ ] `npm run build` passes
- [ ] Deploy to Scalingo works
