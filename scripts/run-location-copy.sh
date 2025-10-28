#!/bin/bash

# Script to copy location from Qasim+11@gmail.com to all other users
# Usage: ./run-location-copy.sh [mode]
# Mode options:
#   - all (default): Copy location to all users
#   - specific: Copy location to specific users (modify script for specific emails)

echo "Starting location copying from Qasim+11@gmail.com..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Set mode (default to 'all')
MODE=${1:-all}

echo "Mode: $MODE"

# Build the project first to ensure all dependencies are compiled
echo "Building project..."
npm run build

# Run the compiled JavaScript script
if [ "$MODE" = "specific" ]; then
    echo "Copying location to specific users..."
    node dist/scripts/copy-location-to-all-users.js specific
else
    echo "Copying location to ALL users..."
    node dist/scripts/copy-location-to-all-users.js all
fi

echo "Location copying completed!"

