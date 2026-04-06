#!/bin/bash
set -e

# Run from inside a worktree. Pushes branch, creates PR, and shows cleanup instructions.

REPO="mike-scott-darwin/codify-site"
BRANCH=$(git branch --show-current)
MAIN_REPO="/Users/michaelscott/conductor/repos/codify-site"

if [ "$BRANCH" = "main" ]; then
  echo "Error: You're on main. Switch to a task branch first."
  exit 1
fi

# Extract issue number from branch name (codify-site/7-tokyo → 7)
ISSUE_NUM=$(echo "$BRANCH" | sed 's|codify-site/||' | grep -o '^[0-9]*')

# Push
echo "Pushing $BRANCH..."
git push -u origin "$BRANCH"

# Create PR
echo "Creating PR..."
if [ -n "$ISSUE_NUM" ]; then
  CLOSE_LINE="Closes #$ISSUE_NUM"
else
  CLOSE_LINE=""
fi

# Get commit messages for PR body
COMMITS=$(git log main.."$BRANCH" --oneline 2>/dev/null || echo "")

PR_URL=$(gh pr create --repo "$REPO" --title "$(git log -1 --format=%s)" --body "$(cat <<EOF
## Summary
${COMMITS}

${CLOSE_LINE}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)" 2>&1)

echo ""
echo "PR created: $PR_URL"
echo ""
echo "After merge, clean up:"
echo "  cd $MAIN_REPO"
echo "  git pull origin main"
echo "  git worktree remove $(pwd)"
echo "  git branch -d $BRANCH"
