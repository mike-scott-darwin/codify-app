#!/bin/bash
set -e

# Deploy scan-handler to M1 Mac Mini and restart poller

M1="michaelscott@100.88.4.114"
LOCAL_SRC="scan-handler/src"
REMOTE_DIR="~/scan-handler/src"

echo "Deploying scan-handler to M1..."
scp -r "$LOCAL_SRC"/* "$M1:$REMOTE_DIR/"

echo "Restarting poller..."
ssh "$M1" 'PATH=/opt/homebrew/bin:$PATH && lsof -ti:3141 | xargs kill -9 2>/dev/null; cd ~/scan-handler && nohup node --env-file=.env src/poller.js > poller.log 2>&1 &'

sleep 2
ssh "$M1" 'tail -3 ~/scan-handler/poller.log'

echo ""
echo "Deployed and restarted."
