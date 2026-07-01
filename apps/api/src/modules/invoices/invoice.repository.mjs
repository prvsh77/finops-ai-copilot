import { BaseRepository } from "../../core/repository.mjs";

export class InvoiceRepository extends BaseRepository {
  constructor() {
    super("invoices");
  }

  async listPaginated(organizationId, filters = {}) {
    const {
      page = 1,
      per_page = 15,
      search,
      status,
      type = "ap",
      po_match_status,
      start_date,
      end_date,
      sort_by = "due_date",
      sort_order = "asc",
    } = filters;

    let items = await this.list((inv) => inv.organization_id === organizationId && inv.type === type && !inv.deleted_at);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (inv) =>
          inv.invoice_number?.toLowerCase().includes(q) ||
          inv.po_number?.toLowerCase().includes(q) ||
          inv.description?.toLowerCase().includes(q) ||
          inv.amount?.toString().includes(q)
      );
    }
    if (status) {
      items = items.filter((inv) => inv.status === status);
    }
    if (po_match_status) {
      items = items.filter((inv) => inv.po_match_status === po_match_status);
    }
    if (start_date) {
      items = items.filter((inv) => new Date(inv.invoice_date) >= new Date(start_date));
    }
    if (end_date) {
      items = items.filter((inv) => new Date(inv.invoice_date) <= new Date(end_date));
    }

    items.sort((a, b) => {
      let valA = a[sort_by];
      let valB = b[sort_by];

      if (sort_by === "amount" || sort_by === "ocr_confidence") {
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

export const invoiceRepository = new InvoiceRepository();
