import { BaseRepository } from "../../core/repository.mjs";

export class PaymentRepository extends BaseRepository {
  constructor() {
    super("payments");
  }

  async listPaginated(organizationId, filters = {}) {
    const {
      page = 1,
      per_page = 15,
      search,
      status,
      vendor_id,
      rail,
      sort_by = "created_at",
      sort_order = "desc",
    } = filters;

    let items = await this.list((pay) => pay.organization_id === organizationId && !pay.deleted_at);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (pay) =>
          pay.beneficiary_name?.toLowerCase().includes(q) ||
          pay.rail?.toLowerCase().includes(q) ||
          pay.status?.toLowerCase().includes(q) ||
          pay.amount?.toString().includes(q)
      );
    }
    if (status) {
      items = items.filter((pay) => pay.status === status);
    }
    if (vendor_id) {
      items = items.filter((pay) => pay.vendor_id === vendor_id);
    }
    if (rail) {
      items = items.filter((pay) => pay.rail === rail);
    }

    items.sort((a, b) => {
      let valA = a[sort_by];
      let valB = b[sort_by];

      if (sort_by === "amount") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else {
        valA = String(valA || "");
        valB = String(valB || "");
      }

      if (valA < valB) return sort_order === "asc" ? -1 : 1;
      if (valA > valB) return sort_order === "asc" ? 1 : -1;
      return 0;
    });

    const total = items.length;
    const paginated = items.slice((page - 1) * per_page, page * per_page);

    return {
      data: paginated,
      pagination: {
        page: Number(page),
        per_page: Number(per_page),
        total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }
}

export const paymentRepository = new PaymentRepository();
