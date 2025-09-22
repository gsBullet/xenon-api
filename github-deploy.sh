#!/bin/bash
APP_DIR="$(pwd)"
REPO_URL="git@github.com:RetinaInnovex/retina-backend-api.git"

cd $APP_DIR || exit

# Fetch latest changes
git pull origin main

# Install dependencies and restart the app
npm install
pm2 stop all
npm run deploy
pm2 logs
