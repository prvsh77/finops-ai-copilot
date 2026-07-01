import { BaseRepository } from "../../core/repository.mjs";
import { store } from "../../store.mjs";

export class SessionRepository extends BaseRepository {
  constructor() {
    super("sessions");
  }

  async listActiveByUser(userId) {
    return this.list((session) => session.user_id === userId && !session.revoked_at);
  }

  async findRefreshToken(tokenHash) {
    await store.load();
    return store.find("refresh_tokens", (rt) => rt.token_hash === tokenHash && !rt.revoked_at);
  }

  async createRefreshToken(rtRecord) {
    await store.load();
    const inserted = store.insert("refresh_tokens", rtRecord);
    await store.save();
    return inserted;
  }

  async revokeRefreshToken(tokenHash) {
    await store.load();
    store.update("refresh_tokens", (rt) => rt.token_hash === tokenHash, (rt) => {
      rt.revoked_at = new Date().toISOString();
    });
    await store.save();
  }

  async findResetToken(tokenHash) {
    await store.load();
    return store.find("password_reset_tokens", (rst) => rst.token_hash === tokenHash && !rst.used_at);
  }

  async createResetToken(rstRecord) {
    await store.load();
    const inserted = store.insert("password_reset_tokens", rstRecord);
    await store.save();
    return inserted;
  }

  async useResetToken(tokenHash) {
    await store.load();
    store.update("password_reset_tokens", (rst) => rst.token_hash === tokenHash, (rst) => {
      rst.used_at = new Date().toISOString();
    });
    await store.save();
  }
}

export const sessionRepository = new SessionRepository();
