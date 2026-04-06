# Database Migrations

This folder contains SQL migration files for the Energy CRM database.

## Structure

```
db/
├── README.md          # This file
├── migrate.sh         # Migration runner script
└── migrations/
    ├── 001_initial_schema.sql              # v0.1.0 - Tables, enums, foreign keys
    └── 002_activity_contact_required.sql   # v0.2.0 - contact_id NOT NULL on activities
```

## Naming Convention

Migrations follow the pattern: `NNN_description.sql`

- `NNN` — 3-digit sequential number (001, 002, 003...)
- `description` — short snake_case description of the change

Each file starts with a comment header:

```sql
-- Migration: NNN_description
-- Date: YYYY-MM-DD
-- Version: X.Y.Z
-- Description: What this migration does
```

## Running Migrations

### Prerequisites

- `psql` client installed
- Database URL with credentials

### Fresh database (all migrations)

```bash
./db/migrate.sh "postgres://user:pass@localhost:5432/crm"
```

### Specific migration only

```bash
./db/migrate.sh "postgres://user:pass@localhost:5432/crm" 002
```

### Via Scalingo db-tunnel

```bash
# Terminal 1: open the tunnel
scalingo --app crmenergy db-tunnel -i ~/.ssh/id_ed25519 SCALINGO_POSTGRESQL_URL

# Terminal 2: run migrations
./db/migrate.sh "postgres://crmenergy_8715:PASSWORD@127.0.0.1:10000/crmenergy_8715"
```

## How It Works

- The script creates a `_migrations` tracking table on first run
- Each migration is applied once — the script checks `_migrations` before running
- Already-applied migrations are skipped
- Migrations run in order (sorted by filename)

## Development Workflow

For day-to-day development, you can still use Drizzle's push command:

```bash
npm run db:push    # Push schema changes directly (no migration file)
```

Use `db/migrations/` for versioned, reviewable changes that need to run on production.

## Adding a New Migration

1. Create a new file: `db/migrations/NNN_description.sql`
2. Write the SQL (ALTER TABLE, CREATE INDEX, etc.)
3. Test locally: `./db/migrate.sh "postgres://postgres:postgres@localhost:5432/crm" NNN`
4. Commit the file
5. Run on production via db-tunnel
