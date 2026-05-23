/**
 * Pharmacy batch inventory API
 */
import { apiFetch, ensureCsrfCookie } from "./client";

const BASE = "/api/pharmacy/inventory";

// ——— Summary inventory (per drug) ———

export async function apiGetInventory(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`${BASE}${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function apiGetAnalytics() {
  return apiFetch(`${BASE}/analytics`, { method: "GET" });
}

export async function apiGetTrash() {
  return apiFetch(`${BASE}/trash`, { method: "GET" });
}

export async function apiGetStockHistory(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`${BASE}/history${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function apiAddDrug(drugData) {
  await ensureCsrfCookie();
  return apiFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(drugData),
  });
}

/** @param {number} inventoryId pharmacy_drug_inventories id */
export async function apiUpdateDrug(inventoryId, drugData) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/${inventoryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(drugData),
  });
}

export async function apiDeleteDrug(inventoryId) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/${inventoryId}`, { method: "DELETE" });
}

export async function apiRestoreDrug(inventoryId) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/${inventoryId}/restore`, { method: "POST" });
}

export async function apiToggleAvailability(inventoryId) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/${inventoryId}/toggle-availability`, { method: "PATCH" });
}

export async function apiSearchDrugs(query) {
  return apiGetInventory({ search: query });
}

// ——— Batch-level ———

export async function apiGetDrugBatches(drugId) {
  return apiFetch(`${BASE}/batches/drug/${drugId}`, { method: "GET" });
}

export async function apiGetExpiringBatches(days = 90) {
  return apiFetch(`${BASE}/batches/expiring?days=${days}`, { method: "GET" });
}

export async function apiGetLowStockBatches() {
  return apiFetch(`${BASE}/batches/low-stock`, { method: "GET" });
}

export async function apiUpdateBatchInventory(batchInventoryId, data) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/batches/${batchInventoryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/** Add or remove units from a batch (no manual total calculation). quantity_change: +10 or -5 */
export async function apiAdjustBatchStock(batchInventoryId, { quantity_change, reason, low_stock_threshold }) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/batches/${batchInventoryId}/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity_change, reason, low_stock_threshold }),
  });
}

export async function apiDispenseFifo({ drug_id, quantity, reason }) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/batches/dispense`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drug_id, quantity, reason }),
  });
}

export async function apiGetBatchAlerts(status) {
  const query = status ? `?status=${status}` : "";
  return apiFetch(`${BASE}/batches/alerts${query}`, { method: "GET" });
}

export async function apiAcknowledgeAlert(alertId) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/batches/alerts/${alertId}/acknowledge`, { method: "POST" });
}

export async function apiResolveAlert(alertId) {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/batches/alerts/${alertId}/resolve`, { method: "POST" });
}

export async function apiRunAlertCheck() {
  await ensureCsrfCookie();
  return apiFetch(`${BASE}/batches/alerts/check`, { method: "POST" });
}

// ——— Purchase orders ———

const PO_BASE = "/api/pharmacy/purchase-orders";

export async function apiGetPurchaseOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`${PO_BASE}${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function apiCreatePurchaseOrder(payload) {
  await ensureCsrfCookie();
  return apiFetch(PO_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function apiGetPurchaseOrder(id) {
  return apiFetch(`${PO_BASE}/${id}`, { method: "GET" });
}

export async function apiReceivePurchaseOrder(id, items) {
  await ensureCsrfCookie();
  return apiFetch(`${PO_BASE}/${id}/receive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

export default {
  apiGetInventory,
  apiGetAnalytics,
  apiGetTrash,
  apiGetStockHistory,
  apiAddDrug,
  apiUpdateDrug,
  apiDeleteDrug,
  apiRestoreDrug,
  apiToggleAvailability,
  apiSearchDrugs,
  apiGetDrugBatches,
  apiGetExpiringBatches,
  apiGetLowStockBatches,
  apiUpdateBatchInventory,
  apiAdjustBatchStock,
  apiDispenseFifo,
  apiGetBatchAlerts,
  apiAcknowledgeAlert,
  apiResolveAlert,
  apiRunAlertCheck,
  apiGetPurchaseOrders,
  apiCreatePurchaseOrder,
  apiGetPurchaseOrder,
  apiReceivePurchaseOrder,
};
