import { aiGateway } from "../gateway/ai-gateway.mjs";
import { agentRegistry } from "../agents/agent-registry.mjs";
import { toolRegistry } from "../tools/tool-registry.mjs";
import { ragService } from "../rag/rag.service.mjs";

class AgentOrchestrator {
  async processQuery(organizationId, userId, query, options = {}) {
    const supervisor = agentRegistry.getAgent("supervisor");
    
    // 1. Analyze query to find the correct specialist agent
    const systemPrompt = `${supervisor.instructions}\nBased on the query "${query}", respond with exactly one agent word: 'fraud', 'treasury', 'financial', 'compliance', 'forecast', 'reporting', or 'supervisor'.`;
    const selection = await aiGateway.generateCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ], { model: options.model });

    const selectedAgentRole = selection.text.trim().toLowerCase().replace(/['"]/g, "");
    const agent = agentRegistry.getAgent(selectedAgentRole) || agentRegistry.getAgent("financial");

    // 2. Fetch relevant database tools
    let contextData = "";
    if (selectedAgentRole === "fraud") {
      const txns = await toolRegistry.executeTool("list_transactions", organizationId);
      const invoices = await toolRegistry.executeTool("list_invoices", organizationId);
      contextData = `Context - Transactions: ${JSON.stringify(txns)}\nInvoices: ${JSON.stringify(invoices)}`;
    } else if (selectedAgentRole === "treasury" || selectedAgentRole === "forecast") {
      const balances = await toolRegistry.executeTool("get_cash_positions", organizationId);
      contextData = `Context - Bank Balances: ${JSON.stringify(balances)}`;
    } else {
      const txns = await toolRegistry.executeTool("list_transactions", organizationId);
      contextData = `Context - Transactions: ${JSON.stringify(txns)}`;
    }

    // Retrieve documents from RAG Retrieval Engine
    const rag = await ragService.buildContext(organizationId, query).catch(() => ({ contextText: "" }));
    if (rag.contextText) {
      contextData += `\n\nRetrieved Guidelines Context:\n${rag.contextText}`;
    }

    // 3. Prompt the agent
    const finalPrompt = [
      { role: "system", content: `${agent.instructions}\nUse the following system context when writing your report:\n${contextData}` },
      { role: "user", content: query }
    ];

    const result = await aiGateway.generateCompletion(finalPrompt, options);

    return {
      text: result.text,
      agent: agent.role,
      metrics: aiGateway.getMetrics(),
    };
  }

  async *streamQuery(organizationId, userId, query, options = {}) {
    // Determine the specialist agent
    const supervisor = agentRegistry.getAgent("supervisor");
    const selection = await aiGateway.generateCompletion([
      { role: "system", content: `${supervisor.instructions}\nRespond with exactly one agent word: 'fraud', 'treasury', 'financial', 'compliance', 'forecast', 'reporting'.` },
      { role: "user", content: query }
    ], { model: options.model });

    const selectedAgentRole = selection.text.trim().toLowerCase().replace(/['"]/g, "");
    const agent = agentRegistry.getAgent(selectedAgentRole) || agentRegistry.getAgent("financial");

    let contextData = "";
    if (selectedAgentRole === "fraud") {
      const txns = await toolRegistry.executeTool("list_transactions", organizationId).catch(() => []);
      contextData = `Context - Transactions: ${JSON.stringify(txns)}`;
    } else if (selectedAgentRole === "treasury") {
      const balances = await toolRegistry.executeTool("get_cash_positions", organizationId).catch(() => null);
      contextData = `Context - Bank Balances: ${JSON.stringify(balances)}`;
    }

    // Retrieve documents from RAG Retrieval Engine
    const rag = await ragService.buildContext(organizationId, query).catch(() => ({ contextText: "" }));
    if (rag.contextText) {
      contextData += `\n\nRetrieved Guidelines Context:\n${rag.contextText}`;
    }

    const finalPrompt = [
      { role: "system", content: `${agent.instructions}\nContext: ${contextData}` },
      { role: "user", content: query }
    ];

    yield* aiGateway.generateStream(finalPrompt, options);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
export default agentOrchestrator;
