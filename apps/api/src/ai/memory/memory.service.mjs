import { aiConversationRepository } from "./ai-conversation.repository.mjs";
import { aiMessageRepository } from "./ai-message.repository.mjs";
import { aiGateway } from "../gateway/ai-gateway.mjs";
import { notFound } from "../../errors.mjs";

class MemoryService {
  constructor(conversationRepo = aiConversationRepository, messageRepo = aiMessageRepository) {
    this.conversationRepo = conversationRepo;
    this.messageRepo = messageRepo;
  }

  async listConversations(organizationId) {
    return this.conversationRepo.listByOrg(organizationId);
  }

  async getConversation(id, organizationId) {
    const convo = await this.conversationRepo.find((c) => c.id === id && c.organization_id === organizationId);
    if (!convo) throw notFound("Conversation not found.");
    return convo;
  }

  async createConversation(organizationId, userId, title = "New AI Analysis") {
    const record = {
      id: `con_${crypto.randomUUID()}`,
      organization_id: organizationId,
      user_id: userId,
      title,
      summary: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    return this.conversationRepo.insert(record);
  }

  async getMessages(conversationId) {
    return this.messageRepo.listByConversation(conversationId);
  }

  async addMessage(conversationId, role, content, agentUsed = null) {
    const record = {
      id: `msg_${crypto.randomUUID()}`,
      conversation_id: conversationId,
      role,
      content,
      agent_used: agentUsed,
      created_at: new Date().toISOString(),
    };
    const msg = await this.messageRepo.insert(record);

    // Run compression if context gets too long
    const history = await this.getMessages(conversationId);
    if (history.length >= 10 && history.length % 2 === 0) {
      await this.compressMemory(conversationId, history);
    }

    return msg;
  }

  async compressMemory(conversationId, history) {
    const textToCompress = history.map((m) => `${m.role}: ${m.content}`).join("\n");
    const prompt = [
      { role: "system", content: "Summarize the key decisions, entities mentioned, and findings from this corporate finance conversation transcript. Be extremely concise (under 100 words)." },
      { role: "user", content: textToCompress }
    ];

    try {
      const summaryResult = await aiGateway.generateCompletion(prompt);
      await this.conversationRepo.update(
        (c) => c.id === conversationId,
        (c) => {
          c.summary = summaryResult.text;
          c.updated_at = new Date().toISOString();
        }
      );
    } catch (e) {
      console.error("Memory compression failed:", e);
    }
  }
}

export const memoryService = new MemoryService();
export default memoryService;
