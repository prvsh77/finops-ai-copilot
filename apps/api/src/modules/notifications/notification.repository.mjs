import { BaseRepository } from "../../core/repository.mjs";
import { store } from "../../store.mjs";

export class NotificationRepository extends BaseRepository {
  constructor() {
    super("notifications");
  }

  async listByUser(userId, organizationId) {
    return this.list((notif) => notif.user_id === userId && notif.organization_id === organizationId);
  }

  async findPreference(userId, organizationId) {
    await store.load();
    return store.find("notification_preferences", (p) => p.user_id === userId && p.organization_id === organizationId);
  }

  async savePreference(prefRecord) {
    await store.load();
    const existing = store.find("notification_preferences", (p) => p.user_id === prefRecord.user_id && p.organization_id === prefRecord.organization_id);
    if (existing) {
      Object.assign(existing, prefRecord, { updated_at: new Date().toISOString() });
      await store.save();
      return existing;
    }
    const inserted = store.insert("notification_preferences", prefRecord);
    await store.save();
    return inserted;
  }
}

export const notificationRepository = new NotificationRepository();
