# Fabric Smart Contract Debugger

This project provides a comprehensive script for managing a Fablo network, associated chaincode, and a web application. It simplifies the process of setting up and running a blockchain environment for development and testing purposes.

## Prerequisites

Before using this tool, ensure you have the following software installed:

- Node.js
- Docker
- Docker Compose
- Fablo
- Go
- npm

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Make the script executable:

   ```
   chmod +x script.sh
   ```

## Usage

The script provides several commands to manage different aspects of your blockchain environment:

### Check Environment

To verify that all required software is installed:

```
./script.sh check-env
```

### Manage Fablo Network

To start the Fablo network:

```
./script.sh start-network
```

To stop and remove the current Fablo network:

```
./script.sh stop-network
```

### Manage Chaincode

To build and run the chaincode:

```
./script.sh start-chaincode
```

### Manage Web Application

To install dependencies and start the web application:

```
./script.sh start-webapp
```

## Command Details

- `check-env`: Checks if all required software is installed.
- `start-network`: Starts the Fablo network using the `dev-mode.json` configuration.
- `stop-network`: Stops and removes the current Fablo network.
- `start-chaincode`: Builds and runs the chaincode located in `./fablo/chaincodes/asset-transfer-go`.
- `start-webapp`: Installs npm packages and starts the web application in development mode.

## Directory Structure

- `./fablo`: Contains the Fablo network configuration and chaincode.
- `./fablo/chaincodes/asset-transfer-go`: Contains the Go chaincode for asset transfer.
- `./`: Root directory containing the web application files.

## Notes

- The script will prompt for confirmation before performing actions that might affect the current network state.
- Ensure you're in the correct directory when running the script.
- If you encounter any issues, check the console output for error messages and ensure all prerequisites are correctly installed.

## Contributing

Feel free to submit issues and pull requests to improve this tool.