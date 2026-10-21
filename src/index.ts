import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "linkedin-ai-mcp", version: "0.1.0" });

server.registerTool("get_capabilities", {
  description: "List currently implemented and disabled LinkedIn capabilities",
  inputSchema: {},
}, async () => ({ content: [{ type: "text", text: JSON.stringify({
  connected: false,
  supported: ["get_capabilities", "draft_post"],
  disabled: ["publish", "comment", "react", "delete", "read_feed", "edit_profile", "search_linkedin_jobs"],
  authentication: "not configured",
}) }] }));

server.registerTool("draft_post", {
  description: "Prepare a LinkedIn post locally without publishing",
  inputSchema: { topic: z.string().trim().min(1).max(500), audience: z.string().trim().max(120).optional() },
}, async ({ topic, audience }) => ({ content: [{ type: "text", text: `Rascunho para LinkedIn\n\nTema: ${topic}\nPúblico: ${audience || "profissionais"}\n\n[Escreva sua experiência real e revise antes de publicar.]\n\nStatus: NÃO PUBLICADO` }] }));

await server.connect(new StdioServerTransport());
