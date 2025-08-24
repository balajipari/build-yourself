#!/usr/bin/env python3
"""
Start script that handles migrations and then starts the FastAPI app
"""

import os
import sys
import time
import subprocess
from pathlib import Path

def wait_for_database():
    """Wait for database to be ready"""
    print("⏳ Waiting for database to be ready...")
    
    # Try to connect to database
    while True:
        try:
            import psycopg2
            conn = psycopg2.connect(os.getenv('DATABASE_URL'))
            conn.close()
            print("✅ Database is ready!")
            break
        except Exception as e:
            print(f"Database not ready: {e}")
            print("Waiting 5 seconds...")
            time.sleep(5)

def check_migration_status():
    """Check if migrations have been initialized"""
    print("🔄 Checking database migrations...")
    
    try:
        import psycopg2
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cursor = conn.cursor()
        
        # Check if alembic_version table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'alembic_version'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        if table_exists:
            print("✅ Migration system already initialized")
            return True
        else:
            print("🆕 Migration system not initialized")
            return False
            
    except Exception as e:
        print(f"Error checking migrations: {e}")
        return False

def run_migrations():
    """Run database migrations"""
    print("🔄 Running database migrations...")
    
    try:
        # Run migrations using our management script
        result = subprocess.run(
            ["python", "manage_migrations.py", "upgrade"],
            capture_output=True,
            text=True,
            check=True
        )
        print("✅ Migrations completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def start_app():
    """Start the FastAPI application"""
    print("🚀 Starting FastAPI application...")
    
    # Start uvicorn
    os.execvp("uvicorn", ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--reload"])

def main():
    """Main function"""
    print("🚀 Starting Build Yourself API with Migration Support...")
    print(f"📁 Current directory: {os.getcwd()}")
    print(f"🔧 Environment check:")
    print(f"   DATABASE_URL: {os.getenv('DATABASE_URL', 'Not set')[:50]}...")
    print(f"   PYTHONPATH: {os.getenv('PYTHONPATH', 'Not set')}")
    
    # Wait for database
    wait_for_database()
    
    # Check and run migrations
    if not check_migration_status():
        if not run_migrations():
            print("❌ Failed to run migrations. Exiting.")
            sys.exit(1)
        print("✅ Database schema initialized successfully")
    else:
        # Check for pending migrations
        print("🔄 Checking for pending migrations...")
        try:
            result = subprocess.run(
                ["python", "manage_migrations.py", "upgrade"],
                capture_output=True,
                text=True,
                check=True
            )
            print("✅ All migrations are up to date")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Migration check failed: {e}")
    
    # Start the application
    start_app()

if __name__ == "__main__":
    main()
