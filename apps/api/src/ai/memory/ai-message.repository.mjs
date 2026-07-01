import { BaseRepository } from "../../core/repository.mjs";

export class AiMessageRepository extends BaseRepository {
  constructor() {
    super("ai_messages");
  }

  async listByConversation(conversationId) {
    return this.list((m) => m.conversation_id === conversationId);
  }
}

export const aiMessageRepository = new AiMessageRepository();
