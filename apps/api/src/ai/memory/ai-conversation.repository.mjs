import { BaseRepository } from "../../core/repository.mjs";

export class AiConversationRepository extends BaseRepository {
  constructor() {
    super("ai_conversations");
  }

  async listByOrg(organizationId) {
    return this.list((c) => c.organization_id === organizationId && !c.deleted_at);
  }
}

export const aiConversationRepository = new AiConversationRepository();
