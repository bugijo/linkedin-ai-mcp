import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { previewPost, consumeApprovedPost } from "./approval.js";
import { publishTextPost } from "./linkedin-api.js";
import { loadToken } from "./token-store.js";

const server = new McpServer({ name: "linkedin-ai-mcp", version: "0.1.0" });

server.registerTool("get_capabilities", {
  description: "List currently implemented and disabled LinkedIn capabilities",
  inputSchema: {},
}, async () => ({ content: [{ type: "text", text: JSON.stringify({
  connected: false,
  supported: ["get_capabilities", "draft_post", "preview_publish", "confirm_publish", "auth_status"],
  disabled: ["comment", "react", "delete", "read_feed", "edit_profile", "search_linkedin_jobs"],
  authentication: "run npm run auth; use auth_status to check",
}) }] }));

server.registerTool("draft_post", {
  description: "Prepare a LinkedIn post locally without publishing",
  inputSchema: { topic: z.string().trim().min(1).max(500), audience: z.string().trim().max(120).optional() },
}, async ({ topic, audience }) => ({ content: [{ type: "text", text: `Rascunho para LinkedIn\n\nTema: ${topic}\nPúblico: ${audience || "profissionais"}\n\n[Escreva sua experiência real e revise antes de publicar.]\n\nStatus: NÃO PUBLICADO` }] }));


server.registerTool("auth_status", {
  description: "Check if a locally stored LinkedIn OAuth token is valid without revealing it",
  inputSchema: {},
}, async () => {
  try {
    await loadToken();
    return { content: [{ type: "text", text: "LinkedIn token available and not expired" }] };
  } catch {
    return { content: [{ type: "text", text: "Not authenticated; run npm run auth" }] };
  }
});

server.registerTool("preview_publish", {
  description: "Prepare a LinkedIn text post and generate a one-time approval code; does NOT publish",
  inputSchema: { text: z.string().min(1).max(3000) },
}, async ({ text }) => {
  const preview = previewPost(text);
  return { content: [{ type: "text", text: JSON.stringify({ ...preview, warning: "NOT PUBLISHED. Confirm only after reviewing full text." }) }] };
});

server.registerTool("confirm_publish", {
  description: "Publish the last previewed text post only with its explicit one-time approval code",
  inputSchema: { approvalCode: z.string().length(24) },
}, async ({ approvalCode }) => {
  try {
    const text = consumeApprovedPost(approvalCode);
    const result = await publishTextPost(text);
    return { content: [{ type: "text", text: JSON.stringify({ published: true, ...result }) }] };
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Falha ao publicar" }] };
  }
});

await server.connect(new StdioServerTransport());
