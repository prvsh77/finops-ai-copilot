import { BaseRepository } from "../../core/repository.mjs";

export class FraudAlertRepository extends BaseRepository {
  constructor() {
    super("fraud_alerts");
  }

  async listByOrg(organizationId) {
    return this.list((f) => f.organization_id === organizationId);
  }
}

export class ForecastRepository extends BaseRepository {
  constructor() {
    super("forecasts");
  }

  async listByOrg(organizationId) {
    return this.list((f) => f.organization_id === organizationId);
  }
}

export const fraudAlertRepository = new FraudAlertRepository();
export const forecastRepository = new ForecastRepository();
