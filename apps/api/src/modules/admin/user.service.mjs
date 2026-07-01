import { userRepository } from "./user.repository.mjs";
import { auditService } from "./audit.service.mjs";

class UserService {
  constructor(repo = userRepository) {
    this.repo = repo;
  }

  async getById(id) {
    return this.repo.find((user) => user.id === id && !user.deleted_at);
  }

  async getActiveById(id) {
    return this.repo.findActiveById(id);
  }

  async getByEmail(email) {
    return this.repo.findByEmail(email);
  }

  async list(organizationId) {
    return this.repo.listByOrganization(organizationId);
  }

  async create(userRecord) {
    return this.repo.insert(userRecord);
  }

  async update(id, updater, req, actorId) {
    const user = await this.repo.update((u) => u.id === id, updater);
    if (user) {
      await auditService.log({
        req,
        actorId,
        organizationId: user.organization_id,
        action: "user.updated",
        resourceType: "user",
        resourceId: user.id,
        newValues: { role: user.role, status: user.status },
      });
    }
    return user;
  }

  async delete(id, req, actorId) {
    const user = await this.repo.find((u) => u.id === id);
    if (!user) return false;
    const ok = await this.repo.delete((u) => u.id === id);
    if (ok) {
      await auditService.log({
        req,
        actorId,
        organizationId: user.organization_id,
        action: "user.deleted",
        resourceType: "user",
        resourceId: user.id,
      });
    }
    return ok;
  }

  async incrementFailedLogins(user) {
    return this.repo.update((u) => u.id === user.id, (u) => {
      u.failed_login_attempts += 1;
      if (u.failed_login_attempts >= 5) {
        u.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
    });
  }

  async resetFailedLogins(user) {
    return this.repo.update((u) => u.id === user.id, (u) => {
      u.failed_login_attempts = 0;
      u.locked_until = null;
    });
  }
}

export const userService = new UserService();
export default userService;
