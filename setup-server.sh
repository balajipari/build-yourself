#!/bin/bash

# Function to detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
    else
        OS=$(uname -s)
    fi
}

# Function to install Docker and Docker Compose
install_docker() {
    echo "Installing Docker and Docker Compose..."
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo "Docker and Docker Compose installed successfully!"
}

# Function to install Node.js
install_nodejs() {
    echo "Installing Node.js..."
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install build essentials (needed for some npm packages)
    sudo apt-get install -y build-essential
    
    echo "Node.js installed successfully!"
}

# Main installation process
main() {
    echo "Starting server setup..."
    
    # Update package list
    sudo apt-get update
    
    # Install basic requirements
    sudo apt-get install -y \
        curl \
        git \
        wget \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release
    
    # Install Docker and Docker Compose
    install_docker
    
    # Install Node.js
    install_nodejs
    
    echo "Setup completed successfully!"
    echo "Please log out and log back in for docker group changes to take effect."
    echo "After logging back in, you can run: ./run.sh prod"
}

# Run main function
main
