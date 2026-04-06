#!/bin/bash
set -e

# Usage: ./new-task.sh "Issue title" "Issue body (optional)"
# Creates a GitHub issue, new worktree branch, and opens it

REPO="mike-scott-darwin/codify-site"
MAIN_REPO="/Users/michaelscott/conductor/repos/codify-site"
WORKSPACE_BASE="/Users/michaelscott/conductor/workspaces/codify-site"

TITLE="${1:?Usage: new-task.sh \"Issue title\" \"Optional body\"}"
BODY="${2:-}"

# Create GitHub issue
echo "Creating issue: $TITLE"
ISSUE_URL=$(gh issue create --repo "$REPO" --title "$TITLE" --body "$BODY" 2>&1)
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -o '[0-9]*$')
echo "Created: $ISSUE_URL"

# Generate city name for worktree (random from list)
CITIES=("athens" "berlin" "cairo" "dublin" "edinburgh" "florence" "geneva" "helsinki" "istanbul" "jakarta" "kyoto" "lisbon" "manila" "nairobi" "oslo" "prague" "quito" "riga" "sofia" "tokyo" "utrecht" "vienna" "warsaw" "xiamen" "yangon" "zurich")
CITY="${CITIES[$RANDOM % ${#CITIES[@]}]}"

# Check if city already used
while [ -d "$WORKSPACE_BASE/$CITY" ]; do
  CITY="${CITIES[$RANDOM % ${#CITIES[@]}]}"
done

BRANCH="codify-site/${ISSUE_NUM}-${CITY}"

# Pull latest main
cd "$MAIN_REPO"
git pull origin main

# Create worktree
echo "Creating worktree: $WORKSPACE_BASE/$CITY (branch: $BRANCH)"
git worktree add "$WORKSPACE_BASE/$CITY" -b "$BRANCH"

# Done
echo ""
echo "Ready to work:"
echo "  cd $WORKSPACE_BASE/$CITY"
echo "  Issue: $ISSUE_URL"
echo "  Branch: $BRANCH"
echo ""
echo "When done:"
echo "  git push -u origin $BRANCH"
echo "  gh pr create --title \"$TITLE\" --body \"Closes #$ISSUE_NUM\""
