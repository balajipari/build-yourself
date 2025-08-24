#!/bin/bash
set -e

echo "🚀 Starting Build Yourself API..."
echo "📁 Current directory: $(pwd)"
echo "👤 Current user: $(whoami)"
echo "🔧 Environment check:"
echo "   DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "   PYTHONPATH: ${PYTHONPATH:-'Not set'}"
echo "   Current directory: $(pwd)"
echo "   Entrypoint script: $(ls -la docker-entrypoint.sh)"

echo "🔄 Testing if we can run Python..."
python --version

echo "🔄 Testing if we can import models..."
python -c "from app.models import UserStatus, ProjectStatus; print('✅ Models imported successfully')"

echo "🔄 Testing if we can run migrations..."
python manage_migrations.py --help

echo "🚀 Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 5000 --reload
