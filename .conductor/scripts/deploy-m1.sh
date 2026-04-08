#!/bin/bash
set -e

# Deploy scan-handler to M1 Mac Mini and restart poller via pm2

M1="michaelscott@100.88.4.114"
LOCAL_SRC="scan-handler/src"
REMOTE_DIR="~/scan-handler/src"

echo "Deploying scan-handler to M1..."
scp -r "$LOCAL_SRC"/* "$M1:$REMOTE_DIR/"
scp scan-handler/ecosystem.config.cjs "$M1:~/scan-handler/"

echo "Restarting poller via pm2..."
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && cd ~/scan-handler && mkdir -p logs && pm2 restart ecosystem.config.cjs --update-env 2>/dev/null || pm2 start ecosystem.config.cjs'

sleep 2
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && pm2 status codify-poller'

echo ""
echo "Deployed and restarted."
