import { createSupabaseServer } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getFileContent,
  listDirectory,
  getRecentCommits,
} from "@/lib/vault";
import { getAgent } from "@/lib/agents";
import { NextResponse } from "next/server";

// --- Vault tools that Claude can call ---

const vaultTools: Anthropic.Tool[] = [
  {
    name: "read_vault_file",
    description:
      "Read a file from the client's vault. Use this to read context files, decisions, research, outputs, or any markdown file. Returns the file content and frontmatter.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "File path relative to vault root, e.g. 'reference/core/soul.md' or 'decisions/2026-04-10-pricing.md'",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "list_vault_directory",
    description:
      "List files and folders in a vault directory. Use this to discover what files exist before reading them.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "Directory path relative to vault root, e.g. 'reference/core' or 'decisions'. Use empty string for root.",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_vault_file",
    description:
      "Create or update a file in the client's vault. Use this to save drafts, create decisions, write research notes, or update context files. The file will be committed to the vault automatically.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "File path relative to vault root, e.g. 'content/drafts/linkedin/2026-04-12-positioning.md'",
        },
        content: {
          type: "string",
          description: "The full file content to write (markdown with optional YAML frontmatter)",
        },
        message: {
          type: "string",
          description: "Git commit message describing the change, e.g. '[add] LinkedIn draft on positioning'",
        },
      },
      required: ["path", "content", "message"],
    },
  },
  {
    name: "search_vault",
    description:
      "Search for files in the vault by listing directories and reading file names. Use this when the user asks about topics and you need to find relevant files.",
    input_schema: {
      type: "object" as const,
      properties: {
        directories: {
          type: "array",
          items: { type: "string" },
          description:
            "List of directories to search, e.g. ['decisions', 'research', 'reference/core']",
        },
      },
      required: ["directories"],
    },
  },
  {
    name: "recent_activity",
    description:
      "Get recent vault activity (git commits). Shows what has changed recently — syncs, extractions, new content, updates.",
    input_schema: {
      type: "object" as const,
      properties: {
        count: {
          type: "number",
          description: "Number of recent commits to return (default 10, max 50)",
        },
      },
      required: [],
    },
  },
];

// --- Tool execution ---

async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  token: string,
  repo: string
): Promise<string> {
  switch (toolName) {
    case "read_vault_file": {
      const doc = await getFileContent(token, repo, input.path as string);
      const fm = Object.keys(doc.frontmatter).length > 0
        ? `---\n${Object.entries(doc.frontmatter).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n")}\n---\n\n`
        : "";
      return fm + doc.content;
    }

    case "list_vault_directory": {
      const files = await listDirectory(token, repo, input.path as string);
      return files
        .map((f) => `${f.type === "dir" ? "📁" : "📄"} ${f.name}`)
        .join("\n");
    }

    case "write_vault_file": {
      const path = input.path as string;
      const content = input.content as string;
      const message = input.message as string;

      // Check if file exists (to get SHA for update)
      let sha: string | undefined;
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/contents/${path}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          sha = data.sha;
        }
      } catch {
        // File doesn't exist, will create
      }

      // Create or update via GitHub API
      const writeRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            content: Buffer.from(content).toString("base64"),
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (!writeRes.ok) {
        const err = await writeRes.text();
        return `Error writing file: ${err}`;
      }

      return `✓ File saved: ${path}\nCommit: ${message}`;
    }

    case "search_vault": {
      const dirs = input.directories as string[];
      const results: string[] = [];
      for (const dir of dirs) {
        try {
          const files = await listDirectory(token, repo, dir);
          const mdFiles = files.filter(
            (f) => f.type === "file" && f.name.endsWith(".md")
          );
          results.push(
            `\n## ${dir}/ (${mdFiles.length} files)\n${mdFiles.map((f) => `- ${f.name}`).join("\n")}`
          );
        } catch {
          results.push(`\n## ${dir}/ — not found`);
        }
      }
      return results.join("\n");
    }

    case "recent_activity": {
      const count = Math.min((input.count as number) || 10, 50);
      const commits = await getRecentCommits(token, repo, count);
      return commits
        .map((c) => `${c.date.slice(0, 10)} | ${c.message}`)
        .join("\n");
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// --- Main chat handler ---

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user.email ?? "")
    .single();

  if (!client) {
    return NextResponse.json({ error: "No client config found" }, { status: 403 });
  }

  const githubToken = client.github_token || process.env.GITHUB_TOKEN;
  const repo = client.github_repo;

  if (!githubToken || !repo) {
    return NextResponse.json({ error: "Missing GitHub configuration" }, { status: 500 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "Missing Anthropic API key" }, { status: 500 });
  }

  const { messages, agentId } = await request.json();
  const agent = agentId ? getAgent(agentId) : null;

  // Load core vault context for system prompt
  let vaultContext = "";
  try {
    const coreFiles = ["reference/core/soul.md", "reference/core/offer.md", "reference/core/audience.md", "reference/core/voice.md"];
    const cores = await Promise.all(
      coreFiles.map(async (path) => {
        try {
          const doc = await getFileContent(githubToken, repo, path);
          return `## ${path}\n${doc.content.slice(0, 2000)}`;
        } catch {
          return "";
        }
      })
    );
    vaultContext = cores.filter(Boolean).join("\n\n");
  } catch {
    // Continue without vault context
  }

  const systemPrompt = `You are the Pocket Architect — an AI strategist embedded in the client's Codify vault. You have direct access to their vault files through tools.

## Your Role
- You are the client's personal AI strategist who knows their business deeply
- You read from and write to their vault (a GitHub repo of markdown files)
- Everything you know about them comes from their vault files
- You can create new files, update existing ones, draft content, capture decisions, and conduct research

## Vault Structure
- reference/core/ — The 4 foundation files: soul.md (identity), offer.md (what they sell), audience.md (who buys), voice.md (how they sound)
- decisions/ — Strategic decisions with dates and reasoning
- research/ — Market intelligence, competitive analysis
- outputs/ — Generated content and deliverables
- content/drafts/ — Draft content by platform (linkedin/, email/, ads/, newsletter/)
- content/published/ — Published content
- whatsapp/ — Captured WhatsApp conversations and extracted context
- snapshots/ — Client snapshot deliverables

## Available Skills
You have tools to read files, write files, list directories, search the vault, and check recent activity. Use them proactively:
- When asked to draft content → read voice.md and audience.md first, then write the draft to the appropriate content/drafts/ folder
- When asked about decisions → search the decisions/ directory and read relevant files
- When asked to capture something → write it as a decision or research file with proper frontmatter
- When asked to brief → read recent activity and key context files
- Always read relevant context before generating anything

## Writing Rules
- Use YAML frontmatter on all new files: type, status, date at minimum
- File names: YYYY-MM-DD-slug.md
- Write in the client's voice (read voice.md first)
- Plain language — the client is a non-technical business owner

## Current Vault Context
${vaultContext || "No core files loaded yet. Use the read_vault_file tool to load context."}

## Important
- Never make up information about the client — always read from the vault
- If you don't know something, search the vault or ask the client
- Every response should be grounded in vault context
${agent ? `\n## Agent Role: ${agent.name}\n${agent.systemPrompt}` : ""}`;

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // Convert messages to Anthropic format
  const anthropicMessages: Anthropic.MessageParam[] = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })
  );

  // Stream with tool use loop
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let continueLoop = true;

        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: systemPrompt,
            tools: vaultTools,
            messages: anthropicMessages,
            stream: true,
          });

          let currentText = "";
          let toolUseBlocks: { id: string; name: string; input: string }[] = [];
          let currentToolId = "";
          let currentToolName = "";
          let currentToolInput = "";
          let stopReason = "";

          for await (const event of response) {
            if (event.type === "content_block_start") {
              if (event.content_block.type === "text") {
                // Text block starting
              } else if (event.content_block.type === "tool_use") {
                currentToolId = event.content_block.id;
                currentToolName = event.content_block.name;
                currentToolInput = "";
              }
            } else if (event.type === "content_block_delta") {
              if (event.delta.type === "text_delta") {
                currentText += event.delta.text;
                // Stream text to client in OpenAI-compatible format
                const chunk = JSON.stringify({
                  choices: [{ delta: { content: event.delta.text } }],
                });
                controller.enqueue(
                  encoder.encode(`data: ${chunk}\n\n`)
                );
              } else if (event.delta.type === "input_json_delta") {
                currentToolInput += event.delta.partial_json;
              }
            } else if (event.type === "content_block_stop") {
              if (currentToolId) {
                toolUseBlocks.push({
                  id: currentToolId,
                  name: currentToolName,
                  input: currentToolInput,
                });
                currentToolId = "";
                currentToolName = "";
                currentToolInput = "";
              }
            } else if (event.type === "message_delta") {
              stopReason = event.delta.stop_reason || "";
            }
          }

          if (stopReason === "tool_use" && toolUseBlocks.length > 0) {
            // Add assistant message with tool use
            const assistantContent: Anthropic.ContentBlockParam[] = [];
            if (currentText) {
              assistantContent.push({ type: "text", text: currentText });
            }
            for (const tool of toolUseBlocks) {
              let parsedInput = {};
              try {
                parsedInput = JSON.parse(tool.input);
              } catch {
                parsedInput = {};
              }
              assistantContent.push({
                type: "tool_use",
                id: tool.id,
                name: tool.name,
                input: parsedInput,
              });
            }
            anthropicMessages.push({
              role: "assistant",
              content: assistantContent,
            });

            // Execute tools and add results
            const toolResults: Anthropic.ToolResultBlockParam[] = [];
            for (const tool of toolUseBlocks) {
              let parsedInput = {};
              try {
                parsedInput = JSON.parse(tool.input);
              } catch {
                parsedInput = {};
              }

              // Stream a status indicator
              const statusChunk = JSON.stringify({
                choices: [{ delta: { content: `\n*Reading ${tool.name.replace("_", " ")}...*\n` } }],
              });
              controller.enqueue(encoder.encode(`data: ${statusChunk}\n\n`));

              try {
                const result = await executeTool(
                  tool.name,
                  parsedInput as Record<string, unknown>,
                  githubToken,
                  repo
                );
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: tool.id,
                  content: result,
                });
              } catch (error) {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: tool.id,
                  content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                  is_error: true,
                });
              }
            }

            anthropicMessages.push({
              role: "user",
              content: toolResults,
            });

            // Reset for next iteration
            currentText = "";
            toolUseBlocks = [];
          } else {
            // No more tool calls, we're done
            continueLoop = false;
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        const chunk = JSON.stringify({
          choices: [{ delta: { content: `\n\nError: ${errMsg}` } }],
        });
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
