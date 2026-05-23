/**
 * Shared helpers for batch-aware pharmacy inventory UI
 */

export function getInv(item) {
  if (!item) return {};
  return item.pivot || item.inventory || item;
}

export function getInventoryRowId(item) {
  const inv = getInv(item);
  return inv.id ?? item?.id;
}

export function getDrugId(item) {
  return item?.id ?? item?.drug?.id ?? getInv(item).drug_id;
}

export function formatInventoryDate(value) {
  if (!value) return "—";
  return String(value).split("T")[0];
}

export function normalizeInventoryList(response) {
  if (!response) return { items: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  if (response.success) {
    return {
      items: Array.isArray(response.data) ? response.data : [],
      meta: response.meta || { current_page: 1, last_page: 1, total: 0 },
    };
  }
  const data = response.data ?? response;
  if (Array.isArray(data)) {
    return { items: data, meta: response.meta || { current_page: 1, last_page: 1, total: data.length } };
  }
  return { items: [], meta: { current_page: 1, last_page: 1, total: 0 } };
}

export function getPerformerName(log) {
  const user = log?.performedBy || log?.performer;
  return user?.Name || user?.name || "System";
}

export function getHistoryDrugName(log) {
  const fromBatch =
    log?.drug_batch?.drug?.brand_name_en ||
    log?.drugBatch?.drug?.brand_name_en;
  return log?.inventory?.drug?.brand_name_en || fromBatch || "Unknown drug";
}

export function getHistoryBatchNumber(log) {
  return (
    log?.drug_batch?.batch_number ||
    log?.drugBatch?.batch_number ||
    null
  );
}

export function getHistoryQuantities(log) {
  const oldQ = log.old_quantity ?? log.old_stock ?? 0;
  const newQ = log.new_quantity ?? log.new_stock ?? 0;
  return { oldQ, newQ };
}

export function stockStatus(inv) {
  const stock = inv.stock ?? 0;
  const threshold = inv.low_stock_threshold ?? 10;
  if (!inv.is_available && inv.is_available !== undefined) return "disabled";
  if (stock === 0) return "out";
  if (stock <= threshold) return "low";
  return "ok";
}

export const EMPTY_DRUG_FORM = {
  brand_name_en: "",
  brand_name_am: "",
  genericName: "",
  about_drug_en: "",
  about_drug_am: "",
  stock: "",
  low_stock_threshold: 10,
  price: "",
  cost_price: "",
  manufacturer: "",
  category: "",
  dosage_form: "",
  expire_date: "",
  manufacture_date: "",
  batch_number: "",
  batch_inventory_id: null,
  rxRequired: false,
};
