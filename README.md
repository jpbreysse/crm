# Energy CRM

**Version 0.2.0**

A lightweight CRM application built for energy consulting firms. Designed to replace heavyweight solutions like Salesforce Sales Cloud with a focused, fast, and cost-effective tool for managing companies, contacts, and deals.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Database Queries](#database-queries)
6. [Getting Started](#getting-started)
7. [Scripts Reference](#scripts-reference)
8. [Project Structure](#project-structure)
9. [Roadmap](#roadmap)

---

## Architecture

Energy CRM is a **fullstack SvelteKit application**. SvelteKit serves as both the frontend framework and the backend API layer, eliminating the need for a separate server.

```
┌─────────────────────────────────────────────────┐
│                    Browser                      │
│  ┌───────────────────────────────────────────┐  │
│  │  SvelteKit Frontend (Svelte 5)            │  │
│  │  - Dashboard, Companies, Contacts, Deals  │  │
│  │  - shadcn-svelte UI components            │  │
│  │  - Tailwind CSS v4 styling                │  │
│  └──────────────────┬────────────────────────┘  │
└─────────────────────┼───────────────────────────┘
                      │ HTTP (Form Actions / Load Functions)
┌─────────────────────┼───────────────────────────┐
│  SvelteKit Server   │                           │
│  ┌──────────────────┴────────────────────────┐  │
│  │  +page.server.ts (Server-Side Logic)      │  │
│  │  - load() functions for data fetching     │  │
│  │  - actions for form submissions (CRUD)    │  │
│  └──────────────────┬────────────────────────┘  │
│                     │                           │
│  ┌──────────────────┴────────────────────────┐  │
│  │  Drizzle ORM                              │  │
│  │  - Type-safe query builder                │  │
│  │  - Schema-driven migrations               │  │
│  └──────────────────┬────────────────────────┘  │
└─────────────────────┼───────────────────────────┘
                      │ TCP (port 5432)
┌─────────────────────┼───────────────────────────┐
│  PostgreSQL 16 (Docker)                         │
│  Database: crm                                  │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **No separate API server**: SvelteKit's server-side `load()` functions and form `actions` handle all data operations. This keeps the codebase simple and avoids CORS, serialization, and deployment complexity.
- **Server-only database access**: The database client lives in `$lib/server/`, ensuring it is never bundled into client-side code.
- **Form actions for mutations**: All create/update/delete operations use SvelteKit form actions with progressive enhancement. This means forms work without JavaScript and get enhanced with client-side navigation when JS is available.
- **No client-side state management**: Data flows from the database through `load()` functions to the page. After a form action, SvelteKit automatically re-runs `load()` to refresh the UI.

---

## Tech Stack & Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `drizzle-orm` | ^0.45.2 | Type-safe SQL ORM for PostgreSQL. Provides a query builder that stays close to SQL syntax while offering full TypeScript inference. |
| `postgres` | ^3.4.9 | PostgreSQL client for Node.js (postgres.js). Lightweight, fast driver used by Drizzle under the hood. |
| `bits-ui` | ^2.17.2 | Headless, accessible UI primitives for Svelte. Provides the behavioral foundation for shadcn-svelte components. |
| `clsx` | ^2.1.1 | Utility for constructing CSS class strings conditionally. |
| `tailwind-merge` | ^3.5.0 | Merges Tailwind CSS classes without style conflicts (e.g., resolves `p-4 p-6` to `p-6`). |
| `tailwind-variants` | ^3.2.2 | Variant-based styling API for Tailwind. Used by shadcn-svelte button and badge components. |
| `lucide-svelte` | ^1.0.1 | SVG icon library for Svelte. |
| `dotenv` | ^17.4.1 | Loads environment variables from `.env` files. Used by Drizzle Kit for migrations. |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@sveltejs/kit` | ^2.50.2 | Fullstack Svelte framework. Handles routing, SSR, form actions, and build. |
| `svelte` | ^5.54.0 | Svelte 5 compiler with runes (`$state`, `$props`, `$derived`, `$effect`). |
| `vite` | ^7.3.1 | Build tool and dev server with HMR. |
| `tailwindcss` | ^4.2.2 | Utility-first CSS framework (v4 with CSS-native configuration). |
| `@tailwindcss/vite` | ^4.2.2 | Vite plugin for Tailwind CSS v4 integration. |
| `drizzle-kit` | ^0.31.10 | CLI tool for Drizzle ORM. Handles schema migrations, push, and Drizzle Studio. |
| `typescript` | ^5.9.3 | TypeScript compiler. |
| `svelte-check` | ^4.4.2 | Type checking for Svelte files. |
| `@sveltejs/adapter-auto` | ^7.0.0 | Auto-detects deployment platform (Vercel, Netlify, Cloudflare, etc.). |

---

## Database Schema

The database runs on **PostgreSQL 16** in a Docker container (`postgres-pgvector`), accessible on `localhost:5432`. The database name is `crm`.

### Entity-Relationship Diagram

```
┌──────────┐       ┌───────────┐       ┌──────────┐
│  users   │       │ companies │       │ contacts │
├──────────┤       ├───────────┤       ├──────────┤
│ id (PK)  │       │ id (PK)   │◄──────│company_id│
│ name     │       │ name      │       │ id (PK)  │
│ email    │       │ industry_ │       │first_name│
│ role     │       │  segment  │       │last_name │
│created_at│       │ website   │       │ email    │
└────┬─────┘       │ phone     │       │ phone    │
     │             │ address   │       │job_title │
     │             │ notes     │       │ notes    │
     │             │created_at │       │created_at│
     │             │updated_at │       │updated_at│
     │             └─────┬─────┘       └────┬─────┘
     │                   │                  │
     │             ┌─────┴──────────────────┴─────┐
     │             │           deals              │
     └────────────►├──────────────────────────────┤
      (owner_id)   │ id (PK)                      │
                   │ title                         │
                   │ value                         │
                   │ stage                         │
                   │ expected_close_date           │
                   │ company_id (FK → companies)   │
                   │ contact_id (FK → contacts)    │
                   │ owner_id (FK → users)         │
                   │ description                   │
                   │ created_at, updated_at        │
                   └──────────────┬───────────────┘
                                  │
                   ┌──────────────┴───────────────┐
                   │         activities            │
                   ├──────────────────────────────┤
                   │ id (PK)                      │
                   │ type                          │
                   │ subject                       │
                   │ notes                         │
                   │ date                          │
                   │ contact_id (FK → contacts)    │
                   │ deal_id (FK → deals)          │
                   │ user_id (FK → users)          │
                   │ created_at                    │
                   └──────────────────────────────┘
```

### Enums

| Enum | Values | Description |
|------|--------|-------------|
| `deal_stage` | `lead`, `qualified`, `proposal`, `negotiation`, `won`, `lost` | Sales pipeline stages |
| `activity_type` | `call`, `email`, `meeting`, `note` | Types of logged interactions |
| `industry_segment` | `oil_gas`, `renewables`, `utilities`, `nuclear`, `mining`, `government`, `other` | Energy industry segments |

### Tables

#### `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, auto-generated | Unique identifier |
| `name` | `varchar(255)` | NOT NULL | Full name |
| `email` | `varchar(255)` | NOT NULL, UNIQUE | Email address |
| `role` | `varchar(100)` | nullable | Job role/title |
| `created_at` | `timestamp` | NOT NULL, default NOW | Record creation time |

#### `companies`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, auto-generated | Unique identifier |
| `name` | `varchar(255)` | NOT NULL | Company name |
| `industry_segment` | `industry_segment` enum | nullable | Energy sector classification |
| `website` | `varchar(500)` | nullable | Company website URL |
| `phone` | `varchar(50)` | nullable | Phone number |
| `address` | `text` | nullable | Physical address |
| `notes` | `text` | nullable | Free-form notes |
| `created_at` | `timestamp` | NOT NULL, default NOW | Record creation time |
| `updated_at` | `timestamp` | NOT NULL, default NOW | Last update time |

#### `contacts`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, auto-generated | Unique identifier |
| `first_name` | `varchar(255)` | NOT NULL | First name |
| `last_name` | `varchar(255)` | NOT NULL | Last name |
| `email` | `varchar(255)` | nullable | Email address |
| `phone` | `varchar(50)` | nullable | Phone number |
| `job_title` | `varchar(255)` | nullable | Job title at company |
| `company_id` | `uuid` | FK → companies.id | Associated company |
| `notes` | `text` | nullable | Free-form notes |
| `created_at` | `timestamp` | NOT NULL, default NOW | Record creation time |
| `updated_at` | `timestamp` | NOT NULL, default NOW | Last update time |

#### `deals`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, auto-generated | Unique identifier |
| `title` | `varchar(255)` | NOT NULL | Deal title/name |
| `value` | `numeric(12,2)` | nullable | Deal value in USD |
| `stage` | `deal_stage` enum | NOT NULL, default `lead` | Pipeline stage |
| `expected_close_date` | `date` | nullable | Projected close date |
| `company_id` | `uuid` | FK → companies.id | Associated company |
| `contact_id` | `uuid` | FK → contacts.id | Primary contact |
| `owner_id` | `uuid` | FK → users.id | Assigned salesperson |
| `description` | `text` | nullable | Deal description |
| `created_at` | `timestamp` | NOT NULL, default NOW | Record creation time |
| `updated_at` | `timestamp` | NOT NULL, default NOW | Last update time |

#### `activities`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, auto-generated | Unique identifier |
| `type` | `activity_type` enum | NOT NULL | Activity type |
| `subject` | `varchar(255)` | NOT NULL | Activity subject line |
| `notes` | `text` | nullable | Detailed notes |
| `date` | `timestamp` | NOT NULL, default NOW | When the activity occurred |
| `contact_id` | `uuid` | NOT NULL, FK → contacts.id | Related contact (required — every activity is with a person) |
| `deal_id` | `uuid` | FK → deals.id | Related deal (optional — not every interaction is about a deal) |
| `user_id` | `uuid` | FK → users.id | User who logged it |
| `created_at` | `timestamp` | NOT NULL, default NOW | Record creation time |

---

## API Reference

Energy CRM uses SvelteKit's **server-side load functions** and **form actions** instead of a traditional REST API. Each route has a `+page.server.ts` file that defines data loading and mutations.

### Dashboard

**Route**: `/dashboard`

#### `load()` — GET Dashboard Data

Returns aggregate statistics and recent activity for the dashboard.

| Return Field | Type | Description |
|-------------|------|-------------|
| `stats.companies` | `number` | Total company count |
| `stats.contacts` | `number` | Total contact count |
| `stats.deals` | `number` | Total deal count |
| `stats.wonValue` | `string` | Sum of won deal values (USD) |
| `recentDeals` | `array` | Last 5 deals with company name |
| `recentActivities` | `array` | Last 5 activities with contact name |

---

### Companies

**Route**: `/companies`

#### `load()` — List Companies

Returns all companies ordered by creation date (newest first).

| Return Field | Type | Description |
|-------------|------|-------------|
| `companies` | `array` | All company records |

#### `?/create` — Create Company (Form Action)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Company name |
| `industrySegment` | `industry_segment` | No | Energy sector |
| `website` | `string` | No | Website URL |
| `phone` | `string` | No | Phone number |
| `address` | `string` | No | Physical address |
| `notes` | `string` | No | Free-form notes |

**Error Response**: `{ error: 'Company name is required' }` (400)

---

### Contacts

**Route**: `/contacts`

#### `load()` — List Contacts

Returns all contacts with their associated company name, ordered by creation date (newest first). Also returns a list of all companies for the create form dropdown.

| Return Field | Type | Description |
|-------------|------|-------------|
| `contacts` | `array` | All contacts with `companyName` joined |
| `companies` | `array` | All companies (`id`, `name`) for dropdown |

#### `?/create` — Create Contact (Form Action)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` | Yes | First name |
| `lastName` | `string` | Yes | Last name |
| `email` | `string` | No | Email address |
| `phone` | `string` | No | Phone number |
| `jobTitle` | `string` | No | Job title |
| `companyId` | `uuid` | No | Associated company |
| `notes` | `string` | No | Free-form notes |

**Error Response**: `{ error: 'First and last name are required' }` (400)

---

### Deals

**Route**: `/deals`

#### `load()` — List Deals

Returns all deals with associated company and contact names. Also returns companies and contacts lists for the create form dropdowns.

| Return Field | Type | Description |
|-------------|------|-------------|
| `deals` | `array` | All deals with `companyName`, `contactFirstName`, `contactLastName` |
| `companies` | `array` | All companies (`id`, `name`) for dropdown |
| `contacts` | `array` | All contacts (`id`, `firstName`, `lastName`) for dropdown |

#### `?/create` — Create Deal (Form Action)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Deal title |
| `value` | `number` | No | Deal value in USD |
| `stage` | `deal_stage` | No | Pipeline stage (defaults to `lead`) |
| `expectedCloseDate` | `date` | No | Expected close date |
| `companyId` | `uuid` | No | Associated company |
| `contactId` | `uuid` | No | Primary contact |
| `description` | `string` | No | Deal description |

**Error Response**: `{ error: 'Deal title is required' }` (400)

---

### Activities

**Route**: `/activities`

#### `load()` — List Activities

Returns all activities with associated contact, deal, and company names. Also returns contacts and deals lists for the create form dropdowns.

| Return Field | Type | Description |
|-------------|------|-------------|
| `activities` | `array` | All activities with `contactFirstName`, `contactLastName`, `dealTitle`, `companyName` |
| `contacts` | `array` | All contacts (`id`, `firstName`, `lastName`) for dropdown |
| `deals` | `array` | All deals (`id`, `title`) for dropdown |

#### `?/create` — Create Activity (Form Action)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `activity_type` | No | Activity type (defaults to `note`) |
| `subject` | `string` | Yes | Activity subject line |
| `notes` | `string` | No | Detailed notes |
| `date` | `datetime` | No | When the activity occurred (defaults to now) |
| `contactId` | `uuid` | Yes | Related contact |
| `dealId` | `uuid` | No | Related deal |

**Error Response**: `{ error: 'Subject and contact are required' }` (400)

---

### Deal Detail

**Route**: `/deals/[id]`

#### `load()` — Get Deal with Activities

Returns the deal with its associated company and contact, plus all activities linked to this deal.

| Return Field | Type | Description |
|-------------|------|-------------|
| `deal` | `object` | Deal with `companyName`, `contactFirstName`, `contactLastName` |
| `activities` | `array` | Activities for this deal with contact names |
| `contacts` | `array` | All contacts for the activity form dropdown |

#### `?/createActivity` — Log Activity on Deal (Form Action)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `activity_type` | No | Activity type (defaults to `note`) |
| `subject` | `string` | Yes | Activity subject line |
| `notes` | `string` | No | Detailed notes |
| `date` | `datetime` | No | When the activity occurred |
| `contactId` | `uuid` | Yes | Related contact |

The `dealId` is automatically set from the route parameter.

---

### Contact Detail

**Route**: `/contacts/[id]`

#### `load()` — Get Contact with Activities

Returns the contact with their company, plus all activities linked to this contact.

| Return Field | Type | Description |
|-------------|------|-------------|
| `contact` | `object` | Contact with `companyName` |
| `activities` | `array` | Activities for this contact with deal titles |
| `deals` | `array` | All deals for the activity form dropdown |

#### `?/createActivity` — Log Activity on Contact (Form Action)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `activity_type` | No | Activity type (defaults to `note`) |
| `subject` | `string` | Yes | Activity subject line |
| `notes` | `string` | No | Detailed notes |
| `date` | `datetime` | No | When the activity occurred |
| `dealId` | `uuid` | No | Related deal |

The `contactId` is automatically set from the route parameter.

---

## Database Queries

All queries are executed via Drizzle ORM. Below is a reference of the queries used across the application.

### Dashboard Queries

**Company count**
```sql
SELECT count(*) FROM companies;
```

**Contact count**
```sql
SELECT count(*) FROM contacts;
```

**Deal count**
```sql
SELECT count(*) FROM deals;
```

**Won revenue total**
```sql
SELECT sum(value) FROM deals WHERE stage = 'won';
```

**Recent deals (last 5)**
```sql
SELECT d.id, d.title, d.value, d.stage, c.name AS company_name
FROM deals d
LEFT JOIN companies c ON d.company_id = c.id
ORDER BY d.created_at DESC
LIMIT 5;
```

**Recent activities (last 5)**
```sql
SELECT a.id, a.type, a.subject, a.date, c.first_name, c.last_name
FROM activities a
LEFT JOIN contacts c ON a.contact_id = c.id
ORDER BY a.date DESC
LIMIT 5;
```

### Companies Queries

**List all companies**
```sql
SELECT * FROM companies ORDER BY created_at DESC;
```

**Create company**
```sql
INSERT INTO companies (name, industry_segment, website, phone, address, notes)
VALUES ($1, $2, $3, $4, $5, $6);
```

### Contacts Queries

**List all contacts with company name**
```sql
SELECT c.id, c.first_name, c.last_name, c.email, c.phone,
       c.job_title, c.company_id, co.name AS company_name, c.created_at
FROM contacts c
LEFT JOIN companies co ON c.company_id = co.id
ORDER BY c.created_at DESC;
```

**List companies for dropdown**
```sql
SELECT id, name FROM companies ORDER BY name;
```

**Create contact**
```sql
INSERT INTO contacts (first_name, last_name, email, phone, job_title, company_id, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7);
```

### Deals Queries

**List all deals with company and contact**
```sql
SELECT d.id, d.title, d.value, d.stage, d.expected_close_date,
       d.description, co.name AS company_name,
       c.first_name AS contact_first_name, c.last_name AS contact_last_name,
       d.created_at
FROM deals d
LEFT JOIN companies co ON d.company_id = co.id
LEFT JOIN contacts c ON d.contact_id = c.id
ORDER BY d.created_at DESC;
```

**List contacts for dropdown**
```sql
SELECT id, first_name, last_name FROM contacts ORDER BY last_name;
```

**Create deal**
```sql
INSERT INTO deals (title, value, stage, expected_close_date, company_id, contact_id, description)
VALUES ($1, $2, $3, $4, $5, $6, $7);
```

### Activities Queries

**List all activities with contact, deal, and company**
```sql
SELECT a.id, a.type, a.subject, a.notes, a.date,
       a.contact_id, a.deal_id,
       c.first_name, c.last_name,
       d.title AS deal_title, co.name AS company_name
FROM activities a
LEFT JOIN contacts c ON a.contact_id = c.id
LEFT JOIN deals d ON a.deal_id = d.id
LEFT JOIN companies co ON d.company_id = co.id
ORDER BY a.date DESC;
```

**List activities for a deal**
```sql
SELECT a.id, a.type, a.subject, a.notes, a.date,
       a.contact_id, a.deal_id,
       c.first_name, c.last_name
FROM activities a
LEFT JOIN contacts c ON a.contact_id = c.id
WHERE a.deal_id = $1
ORDER BY a.date DESC;
```

**List activities for a contact**
```sql
SELECT a.id, a.type, a.subject, a.notes, a.date,
       a.contact_id, a.deal_id,
       d.title AS deal_title
FROM activities a
LEFT JOIN deals d ON a.deal_id = d.id
WHERE a.contact_id = $1
ORDER BY a.date DESC;
```

**Create activity**
```sql
INSERT INTO activities (type, subject, notes, date, contact_id, deal_id)
VALUES ($1, $2, $3, $4, $5, $6);
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Docker** with a PostgreSQL container running on port 5432
- **npm**

### Installation

```bash
cd /Users/jean-philippebreysse/dev/energy-crm

# Install dependencies
npm install

# Create the database (if not already created)
docker exec postgres-pgvector psql -U postgres -c "CREATE DATABASE crm;"

# Push the schema to PostgreSQL
npm run db:push

# Start the dev server
npm run dev
```

The application will be available at **http://localhost:5174**.

### Environment Variables

Copy `.env.example` to `.env` and adjust if needed:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/crm
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 5174 with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run TypeScript and Svelte type checking |
| `npm run db:generate` | Generate SQL migration files from schema changes |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema directly to database (dev workflow) |
| `npm run db:studio` | Open Drizzle Studio (visual database browser) |

---

## Project Structure

```
energy-crm/
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment template
├── drizzle.config.ts             # Drizzle ORM configuration
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite + Tailwind + SvelteKit plugins
├── src/
│   ├── app.css                   # Global styles + Tailwind theme
│   ├── app.html                  # HTML shell
│   ├── lib/
│   │   ├── utils.ts              # cn() utility for class merging
│   │   ├── components/
│   │   │   ├── app-sidebar.svelte      # Navigation sidebar
│   │   │   ├── activity-timeline.svelte # Reusable activity timeline
│   │   │   └── ui/               # shadcn-svelte components
│   │   │       ├── badge/
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── input/
│   │   │       ├── label/
│   │   │       └── textarea/
│   │   └── server/
│   │       └── db/
│   │           ├── index.ts      # Database client
│   │           └── schema.ts     # Drizzle schema definitions
│   └── routes/
│       ├── +layout.svelte        # Root layout (sidebar + main area)
│       ├── +page.svelte          # Redirects to /dashboard
│       ├── dashboard/
│       │   ├── +page.server.ts   # Dashboard data loading
│       │   └── +page.svelte      # Dashboard UI
│       ├── activities/
│       │   ├── +page.server.ts   # Activities CRUD
│       │   └── +page.svelte      # Activities list with type filter
│       ├── companies/
│       │   ├── +page.server.ts   # Companies CRUD
│       │   └── +page.svelte      # Companies list + create form
│       ├── contacts/
│       │   ├── +page.server.ts   # Contacts CRUD
│       │   ├── +page.svelte      # Contacts list + create form
│       │   └── [id]/
│       │       ├── +page.server.ts  # Contact detail + activity actions
│       │       └── +page.svelte     # Contact info + activity timeline
│       └── deals/
│           ├── +page.server.ts   # Deals CRUD
│           ├── +page.svelte      # Deals kanban + table + create form
│           └── [id]/
│               ├── +page.server.ts  # Deal detail + activity actions
│               └── +page.svelte     # Deal info + activity timeline
└── drizzle/                      # Generated migration files
```

---

## Changelog

### v0.2.0 (Current)
- Activity history with full CRUD (create, edit, delete)
- Contact is required on all activities (every interaction is with a person)
- Deal detail page (`/deals/[id]`) with info cards and activity timeline
- Contact detail page (`/contacts/[id]`) with info cards and activity timeline
- Reusable activity-timeline component shared across detail pages
- Activities page (`/activities`) with type filter
- Deal titles and contact names are clickable links to detail pages
- Edit and delete for companies, contacts, and deals
- Deployed to Scalingo with Node adapter

### v0.1.0
- Initial release with companies, contacts, and deals management
- Dashboard with stats and recent activity
- Deal pipeline kanban board and table views
- Drizzle ORM with PostgreSQL
- shadcn-svelte UI components

## Roadmap

### v0.3.0 (Planned)
- Search and filtering on list pages
- Sortable table columns
- Pagination for large datasets

### v0.4.0 (Planned)
- User authentication (session-based)
- Role-based access control
- Deal assignment to users

### v0.5.0 (Planned)
- Email integration (log emails as activities)
- Calendar sync for meetings
- Reporting dashboard with charts

---

*Energy CRM v0.2.0 - Built with SvelteKit, Drizzle ORM, and PostgreSQL*
