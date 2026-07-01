import { customerRepository } from "./customer.repository.mjs";
import { notFound } from "../../errors.mjs";
import { eventBus } from "../../core/event-bus.mjs";

class CustomerService {
  constructor(repo = customerRepository) {
    this.repo = repo;
  }

  async list(organizationId) {
    return this.repo.listByOrganization(organizationId);
  }

  async getById(id, organizationId) {
    const c = await this.repo.find((cust) => cust.id === id && cust.organization_id === organizationId && !cust.deleted_at);
    if (!c) throw notFound("Customer not found.");
    return c;
  }

  async create(organizationId, data) {
    const record = {
      id: data.id || `cust_${crypto.randomUUID()}`,
      organization_id: organizationId,
      customer: data.customer,
      segment: data.segment || "Enterprise",
      arr: Number(data.arr ?? 0),
      health: data.health || "Good",
      invoices: Number(data.invoices ?? 0),
      owner: data.owner || "Asha Menon",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const inserted = await this.repo.insert(record);
    eventBus.publish("customer.created", inserted);
    return inserted;
  }

  async update(id, organizationId, data) {
    const updated = await this.repo.update(
      (c) => c.id === id && c.organization_id === organizationId,
      (c) => {
        Object.assign(c, data, { updated_at: new Date().toISOString() });
      }
    );
    if (!updated) throw notFound("Customer not found.");
    eventBus.publish("customer.updated", updated);
    return updated;
  }

  async delete(id, organizationId) {
    const ok = await this.repo.delete((c) => c.id === id && c.organization_id === organizationId);
    if (!ok) throw notFound("Customer not found.");
    eventBus.publish("customer.deleted", { id, organizationId });
    return ok;
  }
}

export const customerService = new CustomerService();
export default customerService;
