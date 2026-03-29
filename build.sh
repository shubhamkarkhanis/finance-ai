#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Install Node modules and build the React frontend
echo "Building Frontend..."
npm install
npm run build

# 2. Install Python dependencies for the backend
echo "Installing Backend Dependencies..."
pip install -r requirements.txt