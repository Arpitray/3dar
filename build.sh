#!/bin/bash

# Vercel Build Script - Handles canvas build issue

echo "=== Starting Vercel Build Process ==="

# Set npm config to avoid optional dependencies
export npm_config_optional=false
export npm_config_audit=false
export npm_config_fund=false

# Install dependencies with strict options
echo "Installing dependencies..."
npm ci --legacy-peer-deps --ignore-scripts 2>&1 | grep -v "npm warn deprecated" || true

# Remove canvas if it was installed (we don't need it for browser-based app)
echo "Cleaning up unnecessary native modules..."
rm -rf node_modules/*/node_modules/canvas 2>/dev/null || true
rm -rf node_modules/mind-ar/node_modules/canvas 2>/dev/null || true

# Build the project
echo "Building with Vite..."
npm run build

echo "=== Build Complete ==="
