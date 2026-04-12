"use client";

import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab =
  | "appearance"
  | "editor"
  | "vault"
  | "ai"
  | "skills"
  | "hotkeys"
  | "account";

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "appearance", label: "Appearance", icon: "◑" },
  { id: "editor", label: "Editor", icon: "✎" },
  { id: "vault", label: "Files & Links", icon: "◆" },
  { id: "ai", label: "AI Model", icon: "◈" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "hotkeys", label: "Hotkeys", icon: "⌘" },
  { id: "account", label: "Account", icon: "◯" },
];

const SKILLS_LIST = [
  { id: "brief", name: "/brief", description: "Summarise vault and recent activity", default: true },
  { id: "draft", name: "/draft", description: "Write content for any platform", default: true },
  { id: "research", name: "/research", description: "Investigate a topic using vault context", default: true },
  { id: "decide", name: "/decide", description: "Record a strategic decision", default: true },
  { id: "extract", name: "/extract", description: "Pull insights from conversations", default: true },
  { id: "audit", name: "/audit", description: "Check what needs attention", default: true },
  { id: "search", name: "/search", description: "Find files by topic", default: true },
  { id: "update", name: "/update", description: "Modify an existing file", default: true },
  { id: "voice", name: "/voice", description: "Review content against voice profile", default: true },
  { id: "activity", name: "/activity", description: "Show recent changes", default: true },
];

const HOTKEYS = [
  { action: "Open skill menu", keys: "/" },
  { action: "Send message", keys: "Enter" },
  { action: "New line in chat", keys: "Shift + Enter" },
  { action: "Toggle sidebar", keys: "⌘ + B" },
  { action: "Toggle chat panel", keys: "⌘ + J" },
  { action: "Search vault", keys: "⌘ + K" },
  { action: "Quick switch file", keys: "⌘ + O" },
  { action: "Settings", keys: "⌘ + ," },
];

function useLocalSetting<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`vault-settings-${key}`);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, [key]);

  function update(v: T) {
    setValue(v);
    try {
      localStorage.setItem(`vault-settings-${key}`, JSON.stringify(v));
    } catch {
      // ignore
    }
  }

  return [value, update];
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors ${
        checked ? "bg-blue" : "bg-border"
      }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {description && <p className="text-xs text-dim mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0 ml-4">{children}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-blue"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>("appearance");

  // Appearance
  const [theme, setTheme] = useLocalSetting("theme", "dark");
  const [fontSize, setFontSize] = useLocalSetting("fontSize", "14");
  const [lineWidth, setLineWidth] = useLocalSetting("lineWidth", "720");
  const [showLineNumbers, setShowLineNumbers] = useLocalSetting("showLineNumbers", false);

  // Editor
  const [spellCheck, setSpellCheck] = useLocalSetting("spellCheck", true);
  const [autoSave, setAutoSave] = useLocalSetting("autoSave", true);
  const [readableWidth, setReadableWidth] = useLocalSetting("readableWidth", true);

  // Vault / Files
  const [linkStyle, setLinkStyle] = useLocalSetting("linkStyle", "relative");
  const [defaultFolder, setDefaultFolder] = useLocalSetting("defaultFolder", "content/drafts");
  const [autoUpdateLinks, setAutoUpdateLinks] = useLocalSetting("autoUpdateLinks", true);

  // AI
  const [model, setModel] = useLocalSetting("aiModel", "claude-sonnet-4-20250514");
  const [contextFiles, setContextFiles] = useLocalSetting("contextFiles", true);
  const [maxTokens, setMaxTokens] = useLocalSetting("maxTokens", "4096");

  // Skills
  const [enabledSkills, setEnabledSkills] = useLocalSetting<Record<string, boolean>>(
    "enabledSkills",
    Object.fromEntries(SKILLS_LIST.map((s) => [s.id, s.default]))
  );

  function toggleSkill(id: string) {
    setEnabledSkills({ ...enabledSkills, [id]: !enabledSkills[id] });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-3xl h-[80vh] bg-surface border border-border rounded-xl shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-border bg-background py-4 overflow-y-auto">
          <p className="px-4 pb-3 text-xs font-medium text-dim uppercase tracking-wider">Settings</p>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                tab === t.id
                  ? "text-blue bg-blue/10"
                  : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-xs w-4 text-center">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Close button */}
          <div className="sticky top-0 flex justify-end p-3 bg-surface/80 backdrop-blur-sm z-10">
            <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>
          </div>

          <div className="px-6 pb-6">
            {/* Appearance */}
            {tab === "appearance" && (
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-4">Appearance</h2>
                <SettingRow label="Theme" description="Choose your preferred colour scheme">
                  <Select
                    value={theme}
                    onChange={setTheme}
                    options={[
                      { value: "dark", label: "Dark" },
                      { value: "light", label: "Light" },
                      { value: "system", label: "System" },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Font size" description="Base font size for the interface">
                  <Select
                    value={fontSize}
                    onChange={setFontSize}
                    options={[
                      { value: "12", label: "12px" },
                      { value: "13", label: "13px" },
                      { value: "14", label: "14px" },
                      { value: "15", label: "15px" },
                      { value: "16", label: "16px" },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Content width" description="Maximum width for document content">
                  <Select
                    value={lineWidth}
                    onChange={setLineWidth}
                    options={[
                      { value: "640", label: "Narrow" },
                      { value: "720", label: "Default" },
                      { value: "900", label: "Wide" },
                      { value: "full", label: "Full width" },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Line numbers" description="Show line numbers in code blocks">
                  <Toggle checked={showLineNumbers} onChange={setShowLineNumbers} />
                </SettingRow>
              </div>
            )}

            {/* Editor */}
            {tab === "editor" && (
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-4">Editor</h2>
                <SettingRow label="Spell check" description="Highlight spelling errors">
                  <Toggle checked={spellCheck} onChange={setSpellCheck} />
                </SettingRow>
                <SettingRow label="Auto-save" description="Save changes automatically when navigating away">
                  <Toggle checked={autoSave} onChange={setAutoSave} />
                </SettingRow>
                <SettingRow label="Readable line length" description="Constrain text width for comfortable reading">
                  <Toggle checked={readableWidth} onChange={setReadableWidth} />
                </SettingRow>
              </div>
            )}

            {/* Files & Links */}
            {tab === "vault" && (
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-4">Files & Links</h2>
                <SettingRow label="Default folder for new files" description="Where Claude creates new files by default">
                  <Select
                    value={defaultFolder}
                    onChange={setDefaultFolder}
                    options={[
                      { value: "content/drafts", label: "content/drafts" },
                      { value: "decisions", label: "decisions" },
                      { value: "research", label: "research" },
                      { value: "outputs", label: "outputs" },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Link format" description="How links are generated in vault files">
                  <Select
                    value={linkStyle}
                    onChange={setLinkStyle}
                    options={[
                      { value: "relative", label: "Relative path" },
                      { value: "absolute", label: "Absolute path" },
                      { value: "shortest", label: "Shortest path" },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Auto-update links" description="Update internal links when files are renamed">
                  <Toggle checked={autoUpdateLinks} onChange={setAutoUpdateLinks} />
                </SettingRow>
              </div>
            )}

            {/* AI Model */}
            {tab === "ai" && (
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-4">AI Model</h2>
                <SettingRow label="Model" description="Which Claude model powers the chat panel">
                  <Select
                    value={model}
                    onChange={setModel}
                    options={[
                      { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4.6" },
                      { value: "claude-opus-4-20250514", label: "Claude Opus 4.6" },
                      { value: "claude-haiku-4-20250414", label: "Claude Haiku 4.5" },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Load context files" description="Automatically load soul, offer, audience, and voice into every conversation">
                  <Toggle checked={contextFiles} onChange={setContextFiles} />
                </SettingRow>
                <SettingRow label="Max response length" description="Maximum tokens per AI response">
                  <Select
                    value={maxTokens}
                    onChange={setMaxTokens}
                    options={[
                      { value: "2048", label: "Short (2K)" },
                      { value: "4096", label: "Default (4K)" },
                      { value: "8192", label: "Long (8K)" },
                    ]}
                  />
                </SettingRow>
                <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                  <p className="text-xs text-dim">
                    The AI reads your core vault files (soul, offer, audience, voice) to ground every response
                    in your business context. It can read, write, search, and create files in your vault using
                    the skills available in the chat panel.
                  </p>
                </div>
              </div>
            )}

            {/* Skills */}
            {tab === "skills" && (
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-4">Skills</h2>
                <p className="text-sm text-muted mb-4">
                  Enable or disable slash commands available in the chat panel.
                  Type <span className="text-blue font-mono">/</span> to see active skills.
                </p>
                {SKILLS_LIST.map((skill) => (
                  <SettingRow key={skill.id} label={skill.name} description={skill.description}>
                    <Toggle
                      checked={enabledSkills[skill.id] ?? skill.default}
                      onChange={() => toggleSkill(skill.id)}
                    />
                  </SettingRow>
                ))}
              </div>
            )}

            {/* Hotkeys */}
            {tab === "hotkeys" && (
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-4">Hotkeys</h2>
                <p className="text-sm text-muted mb-4">
                  Keyboard shortcuts for common actions.
                </p>
                {HOTKEYS.map((hk) => (
                  <div
                    key={hk.action}
                    className="flex items-center justify-between py-3 border-b border-border/50"
                  >
                    <span className="text-sm text-foreground">{hk.action}</span>
                    <kbd className="text-xs text-muted bg-background border border-border rounded px-2 py-1 font-mono">
                      {hk.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            )}

            {/* Account */}
            {tab === "account" && (
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-4">Account</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-xs text-dim uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="text-sm text-foreground">Loaded from session</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-xs text-dim uppercase tracking-wider mb-1">Plan</p>
                    <p className="text-sm text-foreground">Codify</p>
                    <p className="text-xs text-dim mt-1">Managed context engine with Pocket Architect</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-xs text-dim uppercase tracking-wider mb-1">Vault</p>
                    <p className="text-sm text-foreground">Connected via GitHub</p>
                    <p className="text-xs text-dim mt-1">Your vault is a private GitHub repository. All data stays yours.</p>
                  </div>
                  <form action="/vault/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm text-red border border-red/20 rounded-lg hover:bg-red/10 transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
