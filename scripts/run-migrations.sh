#!/bin/bash

# Migration Runner Script
# This script runs database migrations in order

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Database Migrations...${NC}"

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_NAME=${DB_NAME:-build_yourself_dev}
DB_USER=${DB_USER:-builduser}
DB_PASSWORD=${DB_PASSWORD:-buildpass123}

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql command not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; do
    echo "Database not ready, waiting..."
    sleep 2
done

echo -e "${GREEN}✅ Database is ready!${NC}"

# Get the migrations directory
MIGRATIONS_DIR="$(dirname "$0")/../backend/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Error: Migrations directory not found at $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Run migrations in order
echo -e "${YELLOW}📁 Running migrations from: $MIGRATIONS_DIR${NC}"

# Find all .sql files and sort them numerically
MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" | sort -V)

if [ -z "$MIGRATION_FILES" ]; then
    echo -e "${YELLOW}⚠️  No migration files found.${NC}"
    exit 0
fi

for file in $MIGRATION_FILES; do
    filename=$(basename "$file")
    echo -e "${YELLOW}🔄 Running migration: $filename${NC}"
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file"; then
        echo -e "${GREEN}✅ Migration $filename completed successfully${NC}"
    else
        echo -e "${RED}❌ Migration $filename failed${NC}"
        exit 1
    fi
done

echo -e "${GREEN}🎉 All migrations completed successfully!${NC}"
