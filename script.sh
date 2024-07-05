#!/bin/bash

# Default chaincode path
DEFAULT_CHAINCODE_PATH="./fablo/chaincodes/asset-transfer-go"

# Function to check if a command is available
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "$1 is NOT installed"
        exit 1
    fi
}

# Function to check environment
check_environment() {
    echo "Checking environment..."
    for cmd in node docker docker-compose fablo go npm; do
        check_command $cmd
    done
    echo "All required software is installed."
}

# Function to change to fablo directory
change_to_fablo_dir() {
    if [ ! -d "./fablo" ]; then
        echo "Error: ./fablo directory not found"
        exit 1
    fi
    cd ./fablo
}

# Function to execute fablo command
execute_fablo_command() {
    local cmd=$1
    echo "Executing: fablo $cmd"
    fablo $cmd
}

# Function to manage Fablo network
manage_fablo_network() {
    local action=$1
    change_to_fablo_dir

    case $action in
        up)
            echo "Warning: This action will start a new network."
            read -p "Do you want to continue? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                execute_fablo_command "up dev-mode.json"
            else
                echo "Operation cancelled."
            fi
            ;;
        down)
            echo "Warning: This action will stop and remove the current network."
            read -p "Do you want to continue? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                execute_fablo_command "prune"
            else
                echo "Operation cancelled."
            fi
            ;;
        *)
            echo "Invalid action"
            exit 1
            ;;
    esac
}

# Function to run chaincode
run_chaincode() {
    local chaincode_path=${1:-$DEFAULT_CHAINCODE_PATH}
    if [ ! -d "$chaincode_path" ]; then
        echo "Error: Chaincode directory not found: $chaincode_path"
        exit 1
    fi

    cd "$chaincode_path"
    echo "Building chaincode in $chaincode_path..."
    go build -o dev-test

    if [ $? -ne 0 ]; then
        echo "Error: Failed to build chaincode"
        exit 1
    fi

    echo "Running chaincode..."
    CORE_CHAINCODE_LOGLEVEL=debug CORE_PEER_TLS_ENABLED=false CORE_CHAINCODE_ID_NAME=chaincode1:0.0.1 ./dev-test -peer.address 127.0.0.1:8541
}

# Function to run web application
run_web_app() {
    echo "Installing npm packages..."
    npm install

    if [ $? -ne 0 ]; then
        echo "Error: Failed to install npm packages"
        exit 1
    fi

    echo "Starting web application..."
    npm run dev
}

# Main script
case "$1" in
    check-env)
        check_environment
        ;;
    start-network)
        check_environment
        manage_fablo_network up
        ;;
    stop-network)
        check_environment
        manage_fablo_network down
        ;;
    start-chaincode)
        check_environment
        run_chaincode "$2"
        ;;
    start-webapp)
        check_environment
        run_web_app
        ;;
    *)
        echo "Usage: $0 {check-env|start-network|stop-network|start-chaincode [chaincode_path]|start-webapp}"
        echo "  check-env      - Check if required software is installed"
        echo "  start-network  - Start Fablo network using dev-mode.json"
        echo "  stop-network   - Stop and remove the current Fablo network"
        echo "  start-chaincode- Build and run the chaincode. Optional: specify chaincode path"
        echo "  start-webapp   - Install dependencies and start the web application"
        exit 1
        ;;
esac