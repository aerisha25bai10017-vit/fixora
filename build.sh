#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "================================================"
echo "      FIXora Production Build for Render        "
echo "================================================"

echo ">>> 1. Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo ">>> 2. Syncing built frontend to backend/frontend_dist..."
rm -rf backend/frontend_dist
cp -r frontend/dist backend/frontend_dist

echo ">>> 3. Installing Python Backend Dependencies..."
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

echo "================================================"
echo "      Build Completed Successfully!             "
echo "================================================"
