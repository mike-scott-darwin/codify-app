import { NextResponse } from "next/server";

const VAULT_ZIP_URL = "https://codify.build/codify-vault.zip";

const SCRIPT_TEMPLATE = `#!/bin/zsh

# ============================================================
# Codify Vault Installer
# Double-click this file. Everything else is automatic.
# ============================================================

clear
echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║     Building Your Business Brain     ║"
echo "  ║                                      ║"
echo "  ║   This takes about 2 minutes.        ║"
echo "  ║   You may need to enter your         ║"
echo "  ║   Mac password once.                 ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

USER_EMAIL="__EMAIL__"
VAULT_NAME="codify-trial-vault"
VAULT_PATH="$HOME/Documents/$VAULT_NAME"

# --- Step 1: Install Homebrew (if needed) ---
if ! command -v brew &> /dev/null; then
    echo "  [1/5] Installing package manager (you may need to enter your password)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" < /dev/null
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    fi
else
    echo "  [1/5] Package manager ready."
fi

# --- Step 2: Install Git (if needed) ---
if ! command -v git &> /dev/null; then
    echo "  [2/5] Installing version control..."
    xcode-select --install 2>/dev/null
    until command -v git &> /dev/null; do sleep 5; done
else
    echo "  [2/5] Version control ready."
fi

# --- Step 3: Install Obsidian (if needed) ---
if [[ ! -d "/Applications/Obsidian.app" ]]; then
    echo "  [3/5] Installing Obsidian..."
    brew install --cask obsidian 2>/dev/null
else
    echo "  [3/5] Obsidian ready."
fi

# --- Step 4: Install Claude Code (if needed) ---
if ! command -v claude &> /dev/null; then
    echo "  [4/5] Installing AI engine..."
    if ! command -v node &> /dev/null; then
        brew install node 2>/dev/null
    fi
    npm install -g @anthropic-ai/claude-code 2>/dev/null
else
    echo "  [4/5] AI engine ready."
fi

# --- Step 5: Download and set up the vault ---
if [[ -d "$VAULT_PATH" ]]; then
    echo "  [5/5] Vault already exists."
else
    echo "  [5/5] Downloading your vault..."
    mkdir -p "$HOME/Documents"
    curl -sL "__VAULT_ZIP_URL__" -o "/tmp/codify-vault.zip"
    unzip -q "/tmp/codify-vault.zip" -d "$VAULT_PATH" 2>/dev/null
    rm -f "/tmp/codify-vault.zip"
fi

# --- Activate trial ---
echo ""
echo "  Activating your free trial..."

# Fetch trial API key automatically
TRIAL_RESPONSE=$(curl -s -X POST "https://codify.build/api/trial-key" \\
  -H "Content-Type: application/json" \\
  -d "{\\"email\\": \\"$USER_EMAIL\\"}")

API_KEY=$(echo "$TRIAL_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('apiKey',''))" 2>/dev/null)
BASE_URL=$(echo "$TRIAL_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('baseUrl',''))" 2>/dev/null)
MODEL=$(echo "$TRIAL_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('model',''))" 2>/dev/null)

if [[ -n "$API_KEY" && "$API_KEY" != "" ]]; then
    # Persist to shell profile
    SHELL_RC="$HOME/.zshrc"

    # Remove old codify config if present
    if grep -q "# Codify Trial" "$SHELL_RC" 2>/dev/null; then
        sed -i '' '/# Codify Trial/,/# End Codify/d' "$SHELL_RC" 2>/dev/null || true
    fi

    cat >> "$SHELL_RC" << SHELLCONFIG

# Codify Trial
export ANTHROPIC_BASE_URL="$BASE_URL"
export ANTHROPIC_MODEL="$MODEL"
# End Codify
SHELLCONFIG

    # Store key separately
    mkdir -p ~/.claude
    echo "export ANTHROPIC_API_KEY=\\"$API_KEY\\"" > ~/.claude/.codify-key
    echo "source ~/.claude/.codify-key" >> "$SHELL_RC"

    # Set for current session
    export ANTHROPIC_BASE_URL="$BASE_URL"
    export ANTHROPIC_API_KEY="$API_KEY"
    export ANTHROPIC_MODEL="$MODEL"

    echo "  ✓ AI activated"
else
    echo "  ⚠ Could not activate AI automatically."
    echo "    Email hello@codify.build and we'll sort it out."
fi

# Set trial tier
echo "free-trial" > "$VAULT_PATH/00-Context/.tier" 2>/dev/null

# --- Open Obsidian ---
echo ""
echo "  Opening your vault..."

# Try the Obsidian URI first, fall back to opening Obsidian manually
if [[ -d "/Applications/Obsidian.app" ]]; then
    open -a "Obsidian" "$VAULT_PATH" 2>/dev/null || \
    open "obsidian://open?path=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$VAULT_PATH'))")" 2>/dev/null
fi

sleep 3

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║           You're all set.            ║"
echo "  ║                                      ║"
echo "  ║   Your vault is open in Obsidian.    ║"
echo "  ║                                      ║"
echo "  ║   IMPORTANT: Use this Terminal       ║"
echo "  ║   window (not the Claude Desktop     ║"
echo "  ║   app) to run the AI.               ║"
echo "  ║                                      ║"
echo "  ║   Type these two commands below:     ║"
echo "  ╚══════════════════════════════════════╝"
echo ""
echo "  cd ~/Documents/$VAULT_NAME"
echo "  claude"
echo ""
echo "  Once Claude opens, type:  /start"
echo ""
echo "  The AI will ask about your business"
echo "  and build your vault. ~30 minutes."
echo ""
echo "  You can close this window."
echo ""
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "";

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const script = SCRIPT_TEMPLATE
    .replace(/__EMAIL__/g, email)
    .replace(/__VAULT_ZIP_URL__/g, VAULT_ZIP_URL);

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="install-codify.command"',
    },
  });
}
