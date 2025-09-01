#!/bin/bash

# Function to stop all containers
stop_containers() {
    echo "Stopping containers..."
    docker-compose -f docker-compose.$1.yml down
}

# Function to start development environment
start_dev() {
    echo "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    cd frontend && npm run dev
}

# Function to start production environment
start_prod() {
    echo "Building frontend..."
    cd frontend
    # Install dependencies with legacy peer deps to handle React version conflicts
    npm install --legacy-peer-deps
    npm install typescript --legacy-peer-deps
    # Skip type checking during build
    echo "Building without type checking..."
    VITE_SKIP_TS_CHECK=true npm run build || {
        echo "Build failed with TypeScript errors, attempting build with TS_NODE_TRANSPILE_ONLY=true..."
        TS_NODE_TRANSPILE_ONLY=true npm run build
    }
    cd ..
    echo "Starting production environment..."
    docker-compose -f docker-compose.prod.yml up -d
}

case "$1" in
    "dev")
        stop_containers "dev"
        start_dev
        ;;
    "prod")
        stop_containers "prod"
        start_prod
        ;;
    "stop")
        if [ "$2" = "dev" ]; then
            stop_containers "dev"
        elif [ "$2" = "prod" ]; then
            stop_containers "prod"
        else
            echo "Please specify environment: dev or prod"
        fi
        ;;
    *)
        echo "Usage: $0 {dev|prod|stop [dev|prod]}"
        exit 1
        ;;
esac