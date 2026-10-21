import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { reviewPost } from "./post-review.js";

export function createPublicSafeServer(): McpServer {
  const server = new McpServer({ name: "linkedin-ai-mcp", version: "0.3.0" });
  server.registerTool("get_capabilities", {
    description: "List supported capabilities without LinkedIn access",
    inputSchema: {},
  }, async () => ({
    content: [{ type: "text", text: JSON.stringify({
      supported: ["get_capabilities", "draft_post", "preview_post"],
      publicationEnabled: false,
      linkedInConnected: false
    }) }]
  }));
  server.registerTool("draft_post", {
    description: "Create a local LinkedIn post outline; never publishes",
    inputSchema: {
      topic: z.string().trim().min(1).max(500),
      audience: z.string().trim().max(120).optional()
    }
  }, async ({ topic, audience }) => ({
    content: [{ type: "text", text: [
      "Rascunho para LinkedIn", "Tema: " + topic,
      "Público: " + (audience || "profissionais"),
      "Descreva sua experiência e revise antes de compartilhar.",
      "NÃO PUBLICADO"
    ].join("\n\n") }]
  }));
  server.registerTool("preview_post", {
    description: "Review a draft locally without publishing",
    inputSchema: { text: z.string().trim().min(1).max(3000) }
  }, async ({ text }) => ({
    content: [{ type: "text", text: JSON.stringify(reviewPost(text)) }]
  }));
  return server;
}
