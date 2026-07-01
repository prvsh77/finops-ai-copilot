import { notificationRepository } from "./notification.repository.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class NotificationService {
  constructor(repo = notificationRepository) {
    this.repo = repo;
  }

  async list(userId, organizationId) {
    return this.repo.listByUser(userId, organizationId);
  }

  async markAsRead(id, userId, organizationId) {
    const updated = await this.repo.update(
      (notif) => notif.id === id && notif.user_id === userId && notif.organization_id === organizationId,
      (notif) => { notif.status = "Read"; }
    );
    return updated;
  }

  async create(organizationId, userId, type, message, priority = "Normal") {
    const record = {
      id: `not_${crypto.randomUUID()}`,
      organization_id: organizationId,
      user_id: userId,
      type,
      message,
      priority,
      status: "Unread",
      created_at: new Date().toISOString(),
    };
    await this.repo.insert(record);

    // Decoupled async dispatch
    eventBus.publish("notification.created", record);
    return record;
  }

  async getPreference(userId, organizationId) {
    const pref = await this.repo.findPreference(userId, organizationId);
    if (pref) return pref;

    // Return default preferences
    return {
      user_id: userId,
      organization_id: organizationId,
      email: true,
      in_app: true,
      slack: false,
      teams: false,
      priority_minimum: "Low",
    };
  }

  async updatePreference(userId, organizationId, data) {
    const record = {
      user_id: userId,
      organization_id: organizationId,
      email: data.email ?? true,
      in_app: data.in_app ?? true,
      slack: data.slack ?? false,
      teams: data.teams ?? false,
      priority_minimum: data.priority_minimum ?? "Low",
    };
    return this.repo.savePreference(record);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
