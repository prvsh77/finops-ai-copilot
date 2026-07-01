import { BaseRepository } from "../../core/repository.mjs";
import { normalizeEmail } from "../../../../../packages/shared/src/contracts.mjs";

export class UserRepository extends BaseRepository {
  constructor() {
    super("users");
  }

  async findByEmail(email) {
    const norm = normalizeEmail(email);
    return this.find((user) => normalizeEmail(user.email) === norm && !user.deleted_at);
  }

  async findActiveById(id) {
    return this.find((user) => user.id === id && user.status === "active" && !user.deleted_at);
  }

  async listByOrganization(organizationId) {
    return this.list((user) => user.organization_id === organizationId && !user.deleted_at);
  }
}

export const userRepository = new UserRepository();
