#!/bin/bash
set -e

# One-time setup: install pm2 on M1 Mac Mini and configure auto-start on reboot

M1="michaelscott@100.88.4.114"

echo "Installing pm2 on M1..."
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && npm install -g pm2'

echo ""
echo "Killing existing nohup poller (if any)..."
ssh "$M1" 'lsof -ti:3141 | xargs kill -9 2>/dev/null || true'

echo ""
echo "Deploying ecosystem config..."
scp scan-handler/ecosystem.config.cjs "$M1:~/scan-handler/"

echo ""
echo "Starting poller with pm2..."
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && cd ~/scan-handler && mkdir -p logs && pm2 start ecosystem.config.cjs'

echo ""
echo "Configuring pm2 to start on boot (launchd)..."
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && pm2 startup launchd -u michaelscott --hp /Users/michaelscott'
echo ""
echo ">>> If pm2 printed a sudo command above, run it on the M1 to finish setup. <<<"

echo ""
echo "Saving pm2 process list..."
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && pm2 save'

echo ""
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && pm2 status'
echo ""
echo "Done. Poller will now auto-restart on crash and reboot."
