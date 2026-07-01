import { BaseRepository } from "../../core/repository.mjs";

export class TransactionRepository extends BaseRepository {
  constructor() {
    super("transactions");
  }

  async listPaginated(organizationId, filters = {}) {
    const {
      page = 1,
      per_page = 15,
      search,
      reconciliation_status,
      flag_status,
      category_id,
      vendor_id,
      start_date,
      end_date,
      sort_by = "posted_date",
      sort_order = "desc",
    } = filters;

    let items = await this.list((txn) => txn.organization_id === organizationId && !txn.deleted_at);

    // Apply filters
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (txn) =>
          txn.description?.toLowerCase().includes(q) ||
          txn.reference?.toLowerCase().includes(q) ||
          txn.amount?.toString().includes(q)
      );
    }
    if (reconciliation_status) {
      items = items.filter((txn) => txn.reconciliation_status === reconciliation_status);
    }
    if (flag_status) {
      items = items.filter((txn) => txn.flag_status === flag_status);
    }
    if (category_id) {
      items = items.filter((txn) => txn.category_id === category_id);
    }
    if (vendor_id) {
      items = items.filter((txn) => txn.vendor_id === vendor_id);
    }
    if (start_date) {
      items = items.filter((txn) => new Date(txn.posted_date) >= new Date(start_date));
    }
    if (end_date) {
      items = items.filter((txn) => new Date(txn.posted_date) <= new Date(end_date));
    }

    // Apply sorting
    items.sort((a, b) => {
      let valA = a[sort_by];
      let valB = b[sort_by];

      if (sort_by === "amount" || sort_by === "risk_score") {
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

export const transactionRepository = new TransactionRepository();
