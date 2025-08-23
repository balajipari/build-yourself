#!/usr/bin/env python3
"""
Migration runner for Build Yourself API
This script runs database migrations in order and provides proper error handling
"""

import os
import sys
import psycopg2
import time
from pathlib import Path
from typing import List, Tuple

def get_migration_files(migrations_dir: str) -> List[str]:
    """Get sorted list of migration files"""
    migration_files = []
    for file_path in Path(migrations_dir).glob("*.sql"):
        if file_path.is_file():
            migration_files.append(str(file_path))
    
    # Sort by filename to ensure proper order
    migration_files.sort()
    return migration_files

def run_migration(conn, migration_file: str) -> Tuple[bool, str]:
    """Run a single migration file"""
    try:
        print(f"Running migration: {os.path.basename(migration_file)}")
        
        with open(migration_file, 'r') as f:
            sql_content = f.read()
        
        # Execute the entire migration file as one transaction
        with conn.cursor() as cursor:
            try:
                cursor.execute(sql_content)
                print(f"  Migration executed successfully")
            except Exception as e:
                print(f"  Migration failed: {e}")
                return False, f"Migration failed: {e}"
            
            conn.commit()
        
        print(f"✅ Migration {os.path.basename(migration_file)} completed successfully")
        return True, ""
        
    except Exception as e:
        print(f"❌ Migration {os.path.basename(migration_file)} failed: {e}")
        return False, str(e)

def main():
    # Database connection parameters
    db_params = {
        'host': os.getenv('PGHOST', 'postgres'),
        'port': os.getenv('PGPORT', '5432'),
        'database': os.getenv('PGDATABASE', 'build_yourself_dev'),
        'user': os.getenv('PGUSER', 'builduser'),
        'password': os.getenv('PGPASSWORD', 'buildpass123')
    }
    
    migrations_dir = "/migrations"
    
    print("🚀 Starting migration runner...")
    print(f"Database: {db_params['database']} on {db_params['host']}:{db_params['port']}")
    print(f"Migrations directory: {migrations_dir}")
    
    # Wait for database to be ready
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            conn = psycopg2.connect(**db_params)
            conn.close()
            print("✅ Database connection successful!")
            break
        except psycopg2.OperationalError:
            retry_count += 1
            print(f"⏳ Database not ready, waiting... (attempt {retry_count}/{max_retries})")
            time.sleep(2)
    else:
        print("❌ Failed to connect to database after maximum retries")
        sys.exit(1)
    
    # Get migration files
    migration_files = get_migration_files(migrations_dir)
    if not migration_files:
        print("❌ No migration files found!")
        sys.exit(1)
    
    print(f"📁 Found {len(migration_files)} migration files:")
    for file in migration_files:
        print(f"  - {os.path.basename(file)}")
    
    # Run migrations
    conn = psycopg2.connect(**db_params)
    conn.autocommit = False
    
    try:
        for migration_file in migration_files:
            success, error_msg = run_migration(conn, migration_file)
            if not success:
                print(f"❌ Migration failed: {error_msg}")
                conn.rollback()
                sys.exit(1)
        
        print("🎉 All migrations completed successfully!")
        
    except Exception as e:
        print(f"❌ Unexpected error during migrations: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
