import { agentOrchestrator } from "../orchestrator/agent-orchestrator.mjs";
import { memoryService } from "../memory/memory.service.mjs";
import { ragService } from "../rag/rag.service.mjs";
import { aiGateway } from "../gateway/ai-gateway.mjs";
import { agentRegistry } from "../agents/agent-registry.mjs";
import { ok, noContent } from "../../http.mjs";
import { unauthorized, validationError } from "../../errors.mjs";
import { assertRequired } from "../../../../../packages/shared/src/contracts.mjs";

export async function handleAiRoutes(req, res, method, path) {
  const isAiPath = path.startsWith("/ai");
  if (!isAiPath) return false;

  if (!req.user) throw unauthorized();

  const url = new URL(req.url, "http://localhost");

  // GET /ai/agents
  if (method === "GET" && path === "/ai/agents") {
    const list = agentRegistry.listAgents();
    ok(req, res, list);
    return true;
  }

  // GET /ai/models
  if (method === "GET" && path === "/ai/models") {
    const models = [
      { id: "mock-gpt-4", name: "Mock FinOps Predictor" },
      { id: "gpt-4o", name: "OpenAI GPT-4o Enterprise" },
      { id: "gemini-1.5-pro", name: "Google Gemini 1.5 Pro" },
      { id: "llama3", name: "Ollama Llama 3 (Local)" }
    ];
    ok(req, res, models);
    return true;
  }

  // GET /ai/conversations
  if (method === "GET" && path === "/ai/conversations") {
    const list = await memoryService.listConversations(req.user.organization_id);
    ok(req, res, list);
    return true;
  }

  // GET /ai/history
  if (method === "GET" && path === "/ai/history") {
    const convoId = url.searchParams.get("conversation_id");
    if (!convoId) throw validationError([{ field: "conversation_id", message: "Required parameter missing." }]);
    const msgs = await memoryService.getMessages(convoId);
    ok(req, res, msgs);
    return true;
  }

  // POST /ai/evaluate
  if (method === "POST" && path === "/ai/evaluate") {
    const metrics = aiGateway.getMetrics();
    ok(req, res, metrics);
    return true;
  }

  // POST /ai/summary
  if (method === "POST" && path === "/ai/summary") {
    const supervisor = agentRegistry.getAgent("supervisor");
    const summaryPrompt = [
      { role: "system", content: supervisor.instructions },
      { role: "user", content: "Provide a premium board-level executive financial summary of operating metrics." }
    ];
    const result = await aiGateway.generateCompletion(summaryPrompt);
    ok(req, res, { summary: result.text });
    return true;
  }

  // POST /ai/chat OR POST /ai/stream
  if (method === "POST" && (path === "/ai/chat" || path === "/ai/stream")) {
    const details = assertRequired(req.body, ["query"]);
    if (details.length) throw validationError(details);

    let convoId = req.body.conversation_id;
    if (!convoId) {
      const convo = await memoryService.createConversation(req.user.organization_id, req.user.id, `Chat: ${req.body.query.slice(0, 30)}`);
      convoId = convo.id;
    }

    // Add user message to conversation memory
    await memoryService.addMessage(convoId, "user", req.body.query);

    const isStreaming = path === "/ai/stream" || req.body.stream === true;

    if (isStreaming) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });

      try {
        const stream = agentOrchestrator.streamQuery(req.user.organization_id, req.user.id, req.body.query);
        let completeResponse = "";

        for await (const chunk of stream) {
          completeResponse += chunk.text;
          res.write(`data: ${JSON.stringify({ text: chunk.text, conversation_id: convoId })}\n\n`);
        }

        // Save assistant response message to memory
        await memoryService.addMessage(convoId, "assistant", completeResponse, "orchestrator");

        res.write("data: [DONE]\n\n");
      } catch (e) {
        res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
      } finally {
        res.end();
      }
      return true;
    } else {
      // Direct completion response
      const result = await agentOrchestrator.processQuery(req.user.organization_id, req.user.id, req.body.query);
      await memoryService.addMessage(convoId, "assistant", result.text, result.agent);

      ok(req, res, {
        text: result.text,
        agent: result.agent,
        conversation_id: convoId,
        metrics: result.metrics,
      });
      return true;
    }
  }

  return false;
}
