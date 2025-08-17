# Makefile for Build Yourself Docker Operations

.PHONY: help build build-dev build-prod up up-dev down logs clean clean-all test lint

# Default target
help:
	@echo "Available commands:"
	@echo "  build       - Build production Docker images"
	@echo "  build-dev   - Build development Docker images"
	@echo "  up          - Start production services"
	@echo "  up-dev      - Start development services"
	@echo "  down        - Stop all services"
	@echo "  logs        - Show logs for all services"
	@echo "  clean       - Remove containers and networks"
	@echo "  clean-all   - Remove containers, networks, and volumes"
	@echo "  test        - Run tests in development container"
	@echo "  lint        - Run linting in development container"

# Build production images
build:
	docker-compose build

# Build development images
build-dev:
	docker-compose -f docker-compose.dev.yml build

# Start production services
up:
	docker-compose up -d
	@echo "Production services started. API available at http://localhost:5000"

# Start development services
up-dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development services started. API available at http://localhost:5000"

# Stop all services
down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

# Show logs
logs:
	docker-compose logs -f

# Show development logs
logs-dev:
	docker-compose -f docker-compose.dev.yml logs -f

# Clean containers and networks
clean:
	docker-compose down --remove-orphans
	docker-compose -f docker-compose.dev.yml down --remove-orphans
	docker system prune -f

# Clean everything including volumes
clean-all:
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -af
	docker volume prune -f

# Run tests in development container
test:
	docker-compose -f docker-compose.dev.yml exec backend pytest

# Run linting in development container
lint:
	docker-compose -f docker-compose.dev.yml exec backend black .
	docker-compose -f docker-compose.dev.yml exec backend flake8 .

# Database operations
db-migrate:
	docker-compose -f docker-compose.dev.yml exec backend alembic upgrade head

db-rollback:
	docker-compose -f docker-compose.dev.yml exec backend alembic downgrade -1

# Shell access
shell:
	docker-compose -f docker-compose.dev.yml exec backend bash

# Database shell
db-shell:
	docker-compose -f docker-compose.dev.yml exec postgres psql -U builduser -d build_yourself_dev

# Redis shell
redis-shell:
	docker-compose -f docker-compose.dev.yml exec redis redis-cli

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:5000/health || echo "Backend is not healthy"
	@docker-compose exec postgres pg_isready -U builduser -d build_yourself || echo "Database is not healthy"
	@docker-compose exec redis redis-cli ping || echo "Redis is not healthy"

# Setup development environment
setup-dev:
	@echo "Setting up development environment..."
	@mkdir -p data/dev/postgres data/dev/redis data/dev/logs
	@echo "Development directories created"
	@echo "Copy env.prod.template to .env and update with your values"
	@echo "Run 'make up-dev' to start development services"
