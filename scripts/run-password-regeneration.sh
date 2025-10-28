#!/bin/bash

# Script to regenerate passwords for all business users
# Usage: ./run-password-regeneration.sh [mode]
# Mode options:
#   - all (default): Update all users with BUSINESS role
#   - credentials: Update only users from the credentials file

echo "Starting password regeneration for business users..."

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
if [ "$MODE" = "credentials" ]; then
    echo "Regenerating passwords from credentials file..."
    node dist/scripts/regenerate-business-passwords.js credentials
else
    echo "Regenerating passwords for all business users..."
    node dist/scripts/regenerate-business-passwords.js all
fi

echo "Password regeneration completed!"
