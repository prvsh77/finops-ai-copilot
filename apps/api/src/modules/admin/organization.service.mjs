import { organizationRepository } from "./organization.repository.mjs";
import { auditService } from "./audit.service.mjs";

class OrganizationService {
  constructor(repo = organizationRepository) {
    this.repo = repo;
  }

  async getById(id) {
    return this.repo.findActiveById(id);
  }

  async getSettings(organizationId) {
    return this.repo.findSettings(organizationId);
  }

  async create(orgRecord) {
    const org = await this.repo.insert(orgRecord);
    const settings = {
      id: `set_${crypto.randomUUID()}`,
      organization_id: org.id,
      security: { require_mfa: false, session_timeout_minutes: 60, password_min_length: 12 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await this.repo.createSettings(settings);
    return org;
  }

  async update(id, data, req, actorId) {
    const oldOrg = await this.repo.findActiveById(id);
    const updated = await this.repo.update((org) => org.id === id, (org) => {
      for (const field of ["name", "base_currency", "timezone", "fiscal_year_start_month", "mfa_enforced"]) {
        if (data[field] !== undefined) org[field] = data[field];
      }
    });

    if (updated) {
      await auditService.log({
        req,
        actorId,
        organizationId: id,
        action: "organization.updated",
        resourceType: "organization",
        resourceId: id,
        oldValues: oldOrg,
        newValues: updated,
      });
    }
    return updated;
  }

  async completeOnboarding(id, data, req, actorId) {
    const updated = await this.repo.update((org) => org.id === id, (org) => {
      org.onboarding_completed = true;
      org.base_currency = data.base_currency ?? org.base_currency;
      org.timezone = data.timezone ?? org.timezone;
      org.fiscal_year_start_month = data.fiscal_year_start_month ?? org.fiscal_year_start_month;
    });

    if (updated) {
      await auditService.log({
        req,
        actorId,
        organizationId: id,
        action: "organization.onboarded",
        resourceType: "organization",
        resourceId: id,
      });
    }
    return updated;
  }
}

export const organizationService = new OrganizationService();
export default organizationService;
