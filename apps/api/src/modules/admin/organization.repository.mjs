import { BaseRepository } from "../../core/repository.mjs";
import { store } from "../../store.mjs";

export class OrganizationRepository extends BaseRepository {
  constructor() {
    super("organizations");
  }

  async findActiveById(id) {
    return this.find((org) => org.id === id && !org.deleted_at);
  }

  async findSettings(organizationId) {
    await store.load();
    return store.find("organization_settings", (set) => set.organization_id === organizationId);
  }

  async createSettings(settingsRecord) {
    await store.load();
    const inserted = store.insert("organization_settings", settingsRecord);
    await store.save();
    return inserted;
  }
}

export const organizationRepository = new OrganizationRepository();
