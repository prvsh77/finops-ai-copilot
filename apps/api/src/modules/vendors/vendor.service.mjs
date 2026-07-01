import { vendorRepository } from "./vendor.repository.mjs";
import { notFound } from "../../errors.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class VendorService {
  constructor(repo = vendorRepository) {
    this.repo = repo;
  }

  async list(organizationId) {
    return this.repo.listByOrganization(organizationId);
  }

  async getById(id, organizationId) {
    const v = await this.repo.find((vendor) => vendor.id === id && vendor.organization_id === organizationId && !vendor.deleted_at);
    if (!v) throw notFound("Vendor not found.");
    return v;
  }

  async create(organizationId, data) {
    const record = {
      id: data.id || `vnd_${crypto.randomUUID()}`,
      organization_id: organizationId,
      vendor: data.vendor,
      category: data.category,
      spend: Number(data.spend ?? 0),
      risk: data.risk || "Low",
      score: Number(data.score ?? 90),
      status: data.status || "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const inserted = await this.repo.insert(record);
    eventBus.publish("vendor.created", inserted);
    return inserted;
  }

  async update(id, organizationId, data) {
    const updated = await this.repo.update(
      (v) => v.id === id && v.organization_id === organizationId,
      (v) => {
        Object.assign(v, data, { updated_at: new Date().toISOString() });
      }
    );
    if (!updated) throw notFound("Vendor not found.");
    eventBus.publish("vendor.updated", updated);
    return updated;
  }

  async delete(id, organizationId) {
    const ok = await this.repo.delete((v) => v.id === id && v.organization_id === organizationId);
    if (!ok) throw notFound("Vendor not found.");
    eventBus.publish("vendor.deleted", { id, organizationId });
    return ok;
  }
}

export const vendorService = new VendorService();
export default vendorService;
