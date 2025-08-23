FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY migration_requirements.txt .
RUN pip install --no-cache-dir -r migration_requirements.txt

# Copy migration runner script
COPY run_migrations.py .

# Set proper permissions
RUN chmod +x run_migrations.py

# Default command
CMD ["python", "run_migrations.py"]
