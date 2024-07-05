# Fabric Chaincode Debugger

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
./script.sh start-chaincode [optional_chaincode_path]
```

If no path is specified, the script will use the default path: `./fablo/chaincodes/asset-transfer-go`

### Manage Web Application

To install dependencies and start the web application:

```
./script.sh start-webapp
```

## Command Details

- `check-env`: Checks if all required software is installed.
- `start-network`: Starts the Fablo network using the `dev-mode.json` configuration.
- `stop-network`: Stops and removes the current Fablo network.
- `start-chaincode [path]`: Builds and runs the chaincode. You can optionally specify a custom path to the chaincode directory.
- `start-webapp`: Installs npm packages and starts the web application in development mode.

## Directory Structure

- `./fablo`: Contains the Fablo network configuration and default chaincode.
- `./fablo/chaincodes/asset-transfer-go`: Contains the default Go chaincode for asset transfer.
- `./`: Root directory containing the web application files and management script.

## Customizing Chaincode Path

You can specify a custom path for your chaincode when using the `start-chaincode` command. This is useful if you have multiple chaincode implementations or if your chaincode is located in a different directory.

Example:
```
./script.sh start-chaincode /path/to/your/custom/chaincode
```

If no custom path is provided, the script will use the default path (`./fablo/chaincodes/asset-transfer-go`).

## Notes

- The script will prompt for confirmation before performing actions that might affect the current network state.
- Ensure you're in the correct directory when running the script.
- If you encounter any issues, check the console output for error messages and ensure all prerequisites are correctly installed.
- When using a custom chaincode path, make sure the specified directory contains a valid Go chaincode project.

## Contributing

Feel free to submit issues and pull requests to improve this tool.