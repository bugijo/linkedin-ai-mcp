import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadToken } from "./token-store.js";
import { reviewPost } from "./post-review.js";

const server = new McpServer({ name: "linkedin-ai-mcp", version: "0.2.0" });

server.registerTool("get_capabilities", {
  description: "List supported safe, read-only and local tools",
  inputSchema: {},
}, async () => ({
  content: [{ type: "text", text: JSON.stringify({
    supported: ["get_capabilities", "draft_post", "preview_post", "auth_status"],
    unavailable: ["publish", "comment", "react", "delete", "read_feed", "edit_profile", "search_linkedin_jobs"],
    publicationEnabled: false
  }) }]
}));

server.registerTool("draft_post", {
  description: "Prepare a draft locally; does not publish",
  inputSchema: {
    topic: z.string().trim().min(1).max(500),
    audience: z.string().trim().max(120).optional()
  },
}, async ({ topic, audience }) => ({
  content: [{ type: "text", text: [
    "Rascunho LinkedIn", "Tema: " + topic,
    "Público: " + (audience || "profissionais"),
    "Adicione sua experiência real e revise o conteúdo.",
    "NÃO PUBLICADO"
  ].join("\n\n") }]
}));

server.registerTool("preview_post", {
  description: "Review post content without issuing approval credentials",
  inputSchema: { text: z.string().trim().min(1).max(3000) },
}, async ({ text }) => ({
  content: [{ type: "text", text: JSON.stringify(reviewPost(text)) }]
}));

server.registerTool("auth_status", {
  description: "Check locally stored OAuth token without exposing it",
  inputSchema: {},
}, async () => {
  try {
    await loadToken();
    return { content: [{ type: "text", text: "Token local disponível e não expirado." }] };
  } catch {
    return { content: [{ type: "text", text: "Não autenticado. Execute npm run auth." }] };
  }
});

await server.connect(new StdioServerTransport());
