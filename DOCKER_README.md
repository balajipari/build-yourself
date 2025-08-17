# Docker Setup for Build Yourself Backend

This document describes the Docker setup for the Build Yourself backend application, including PostgreSQL database, Redis cache, and the FastAPI application.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx         │    │   Backend       │
│   (Port 5173)   │◄──►│   (Port 80/443) │◄──►│   (Port 5000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (Port 5432)   │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Redis         │
                                               │   (Port 6379)   │
                                               └─────────────────┘
```

## 📁 File Structure

```
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development Docker Compose
├── backend/
│   ├── Dockerfile              # Production Dockerfile
│   ├── Dockerfile.dev          # Development Dockerfile
│   ├── Dockerfile.prod         # Multi-stage production Dockerfile
│   ├── requirements.prod.txt    # Production dependencies
│   ├── init.sql                # Database initialization
│   └── .dockerignore           # Docker ignore file
├── Makefile                    # Docker operations helper
└── DOCKER_README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for using Makefile commands)

### 1. Setup Development Environment

```bash
# Create necessary directories
make setup-dev

# Copy environment template
cp backend/env.prod.template backend/.env

# Edit .env file with your actual values
nano backend/.env
```

### 2. Start Development Services

```bash
# Build and start development services
make up-dev

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Start Production Services

```bash
# Build and start production services
make up

# Or manually:
docker-compose up -d
```

## 🛠️ Available Commands

### Makefile Commands

```bash
make help          # Show all available commands
make build         # Build production images
make build-dev     # Build development images
make up            # Start production services
make up-dev        # Start development services
make down          # Stop all services
make logs          # Show production logs
make logs-dev      # Show development logs
make clean         # Clean containers and networks
make clean-all     # Clean everything including volumes
make test          # Run tests in development container
make lint          # Run linting in development container
make health        # Check service health
```

### Docker Compose Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# Production
docker-compose up -d
docker-compose down
docker-compose logs -f
```

## 🔧 Configuration

### Environment Variables

Copy `backend/env.prod.template` to `backend/.env` and update:

```bash
# Database
DATABASE_URL=postgresql://builduser:buildpass123@postgres:5432/build_yourself
REDIS_URL=redis://redis:6379

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT
JWT_SECRET=your_jwt_secret_key_here
```

### Database Configuration

- **Database**: `build_yourself` (production) / `build_yourself_dev` (development)
- **User**: `builduser`
- **Password**: `buildpass123`
- **Port**: `5432`

### Redis Configuration

- **Port**: `6379`
- **No authentication required** (development setup)

## 🗄️ Database

### Initialization

The database is automatically initialized with:
- User management tables
- Project management tables
- Session management tables
- Chat history tables
- Proper indexes and triggers

### Access Database

```bash
# Development
make db-shell

# Production
docker-compose exec postgres psql -U builduser -d build_yourself
```

### Run Migrations

```bash
make db-migrate
make db-rollback
```

## 📊 Monitoring & Health Checks

### Health Endpoints

- **Backend**: `http://localhost:5000/health`
- **Database**: Automatic PostgreSQL health check
- **Redis**: Automatic Redis health check

### Check All Services

```bash
make health
```

### View Logs

```bash
# All services
make logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 🔒 Security Features

- **Non-root user**: Application runs as `appuser`
- **Network isolation**: Custom Docker network
- **Volume permissions**: Proper file ownership
- **Health checks**: Automatic service monitoring
- **Environment separation**: Development vs production configs

## 🚀 Production Deployment

### 1. Build Production Images

```bash
make build
```

### 2. Set Production Environment

```bash
cp backend/env.prod.template backend/.env
# Edit .env with production values
```

### 3. Start Production Services

```bash
make up
```

### 4. Scale Services (Optional)

```bash
docker-compose up -d --scale backend=3
```

## 🧹 Maintenance

### Clean Up

```bash
# Remove containers and networks
make clean

# Remove everything including volumes (⚠️ Data loss!)
make clean-all
```

### Update Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild with latest code
make build
make up
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U builduser build_yourself > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U builduser build_yourself < backup.sql
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose files
2. **Permission errors**: Run `make clean-all` and recreate volumes
3. **Database connection**: Check if PostgreSQL is healthy
4. **Memory issues**: Increase Docker memory limits

### Debug Commands

```bash
# Check service status
docker-compose ps

# Check service health
make health

# Access container shell
make shell

# View detailed logs
docker-compose logs backend
```

### Reset Everything

```bash
# Complete reset (⚠️ Data loss!)
make clean-all
make setup-dev
make up-dev
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)

## 🤝 Contributing

When adding new services or modifying the Docker setup:

1. Update this README
2. Test both development and production configurations
3. Ensure health checks are implemented
4. Update the Makefile if needed
5. Test volume persistence and data integrity
