#!/bin/bash
# Development deployment script for Cockpit Samba AD DC
# Usage: ./dev-deploy.sh [watch]

set -e

echo "🚀 Building Cockpit Samba AD DC with Vite..."

if [ "$1" == "watch" ]; then
    echo "📦 Starting watch mode..."
    echo "Files will be automatically deployed to system on changes."
    echo "Press Ctrl+C to stop."
    
    npm run build
    sudo cp -r dist/* /usr/share/cockpit/cockpit-samba-ad-dc/
    echo "✅ Initial build deployed to /usr/share/cockpit/cockpit-samba-ad-dc/"
    
    # Watch for file changes and auto-deploy
    npm run watch &
    WATCH_PID=$!
    
    # Monitor dist directory for changes and auto-deploy
    while inotifywait -r -e modify,create,delete,move dist/ 2>/dev/null; do
        echo "📋 Detected changes, deploying to system..."
        sudo cp -r dist/* /usr/share/cockpit/cockpit-samba-ad-dc/ 2>/dev/null || true
        echo "✅ Deployed! Refresh browser to see changes."
    done
    
    kill $WATCH_PID 2>/dev/null || true
else
    # Single build and deploy
    npm run build
    sudo cp -r dist/* /usr/share/cockpit/cockpit-samba-ad-dc/
    sudo systemctl restart cockpit 2>/dev/null || true
    echo "✅ Built and deployed to /usr/share/cockpit/cockpit-samba-ad-dc/"
    echo "🌐 Open https://172.18.146.9:9090 to see changes"
fi