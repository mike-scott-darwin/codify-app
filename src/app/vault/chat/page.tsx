"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { label: "Brief me", prompt: "brief" },
  { label: "Research", prompt: "research " },
  { label: "Draft", prompt: "draft " },
  { label: "Audit", prompt: "What needs attention in my vault?" },
];

export default function PocketArchitectChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text ?? input.trim();
    if (!content || streaming) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        setMessages([...newMessages, { role: "assistant", content: `Error: ${err.error}` }]);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Is the Pocket Architect running?" }]);
    }

    setStreaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-xl font-sans font-bold text-foreground">Pocket Architect</h2>
              <p className="text-muted mt-2 max-w-md mx-auto">
                Your AI strategist. Ask anything about your business, request research, or draft content — all grounded in your vault.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      if (action.prompt.endsWith(" ")) {
                        setInput(action.prompt);
                        textareaRef.current?.focus();
                      } else {
                        sendMessage(action.prompt);
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-muted hover:text-foreground hover:border-blue/40 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue/10 border border-blue/20 text-foreground"
                    : "bg-surface border border-border text-foreground"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="text-xs text-blue mb-1 font-medium">Pocket Architect</p>
                )}
                <div className="text-sm whitespace-pre-wrap">
                  {msg.content || (streaming && i === messages.length - 1 ? "Thinking..." : "")}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {messages.length > 0 && (
            <div className="flex gap-2 mb-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    if (action.prompt.endsWith(" ")) {
                      setInput(action.prompt);
                      textareaRef.current?.focus();
                    } else {
                      sendMessage(action.prompt);
                    }
                  }}
                  className="px-2 py-1 text-xs bg-background border border-border rounded text-dim hover:text-muted transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your Pocket Architect..."
              rows={1}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-dim focus:outline-none focus:border-blue resize-none text-sm"
              style={{ minHeight: "40px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "40px";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className="px-4 py-2 bg-blue text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
