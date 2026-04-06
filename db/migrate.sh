#!/bin/bash
#
# Database Migration Script for Energy CRM
#
# Usage:
#   ./db/migrate.sh <DATABASE_URL> [migration_number]
#
# Examples:
#   # Run all migrations (fresh database)
#   ./db/migrate.sh "postgres://user:pass@localhost:5432/crm"
#
#   # Run a specific migration
#   ./db/migrate.sh "postgres://user:pass@localhost:5432/crm" 002
#
#   # Via Scalingo db-tunnel (run tunnel first, then)
#   ./db/migrate.sh "postgres://crmenergy_8715:PASSWORD@127.0.0.1:10000/crmenergy_8715"
#
# Notes:
#   - Migrations are idempotent where possible (CREATE TYPE IF NOT EXISTS, etc.)
#   - The script tracks applied migrations in a _migrations table
#   - Always review migration SQL before running on production

set -e

DB_URL="$1"
MIGRATION_NUM="$2"
MIGRATIONS_DIR="$(dirname "$0")/migrations"

if [ -z "$DB_URL" ]; then
    echo "Usage: ./db/migrate.sh <DATABASE_URL> [migration_number]"
    echo ""
    echo "Examples:"
    echo "  ./db/migrate.sh \"postgres://user:pass@localhost:5432/crm\""
    echo "  ./db/migrate.sh \"postgres://user:pass@localhost:5432/crm\" 002"
    exit 1
fi

# Create migrations tracking table if it doesn't exist
psql "$DB_URL" -q -c "
CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT now() NOT NULL
);
" 2>/dev/null

echo "=== Energy CRM Database Migrations ==="
echo ""

# Get list of migration files
if [ -n "$MIGRATION_NUM" ]; then
    FILES=$(ls "$MIGRATIONS_DIR"/${MIGRATION_NUM}*.sql 2>/dev/null)
    if [ -z "$FILES" ]; then
        echo "Error: No migration found matching '$MIGRATION_NUM'"
        exit 1
    fi
else
    FILES=$(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort)
fi

if [ -z "$FILES" ]; then
    echo "No migration files found in $MIGRATIONS_DIR"
    exit 0
fi

APPLIED=0
SKIPPED=0

for FILE in $FILES; do
    NAME=$(basename "$FILE")

    # Check if already applied
    ALREADY=$(psql "$DB_URL" -t -q -c "SELECT COUNT(*) FROM _migrations WHERE name = '$NAME';" 2>/dev/null | tr -d ' ')

    if [ "$ALREADY" -gt 0 ]; then
        echo "  [skip] $NAME (already applied)"
        SKIPPED=$((SKIPPED + 1))
    else
        echo "  [run]  $NAME ..."
        psql "$DB_URL" -q -f "$FILE"
        psql "$DB_URL" -q -c "INSERT INTO _migrations (name) VALUES ('$NAME');"
        echo "         done."
        APPLIED=$((APPLIED + 1))
    fi
done

echo ""
echo "=== Complete: $APPLIED applied, $SKIPPED skipped ==="
