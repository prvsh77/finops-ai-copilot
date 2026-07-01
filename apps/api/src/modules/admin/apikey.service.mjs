import { apiKeyRepository } from "./apikey.repository.mjs";
import { auditService } from "./audit.service.mjs";
import { createApiKey, hashSecret } from "../../security.mjs";

class ApiKeyService {
  constructor(repo = apiKeyRepository) {
    this.repo = repo;
  }

  async list(organizationId) {
    return this.repo.listByOrganization(organizationId);
  }

  async create(organizationId, name, scopes, userId, req) {
    const generated = createApiKey();
    const row = await this.repo.insert({
      id: `key_${crypto.randomUUID()}`,
      organization_id: organizationId,
      name: name ?? "Production API Key",
      key_hash: generated.hash,
      key_prefix: generated.prefix,
      scopes: scopes ?? ["dashboard:read"],
      status: "active",
      created_by: userId,
      last_used_at: null,
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await auditService.log({
      req,
      actorId: userId,
      organizationId,
      action: "api_key.created",
      resourceType: "api_key",
      resourceId: row.id,
    });

    return { ...row, key_hash: undefined, api_key: generated.raw };
  }

  async delete(id, organizationId, userId, req) {
    const updated = await this.repo.update(
      (key) => key.id === id && key.organization_id === organizationId,
      (key) => { key.status = "revoked"; }
    );
    if (updated) {
      await auditService.log({
        req,
        actorId: userId,
        organizationId,
        action: "api_key.revoked",
        resourceType: "api_key",
        resourceId: id,
      });
    }
    return updated;
  }

  async findActiveByHash(hash) {
    return this.repo.findActiveByHash(hash);
  }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;
