export function unwrapData(payload) {
  if (payload == null) return payload;
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && "data" in payload) return payload.data;
  return payload;
}

export function normalizePaginated(payload) {
  if (!payload) {
    return { items: [], pagination: { page: 1, perPage: 15, total: 0, totalPages: 1 } };
  }

  if (payload.success === true) {
    const pagination = payload.pagination || {};
    const totalPages = pagination.last_page || pagination.totalPages || 1;
    const page = pagination.current_page || pagination.page || 1;
    const perPage = pagination.per_page || pagination.perPage || 15;
    const total = pagination.total || 0;
    return { items: payload.data || [], pagination: { page, perPage, total, totalPages } };
  }

  const data = payload.data;
  const isPaginatorLike = data && Array.isArray(data.data) && typeof data.current_page === "number";
  if (isPaginatorLike) {
    return {
      items: data.data || [],
      pagination: {
        page: data.current_page,
        perPage: data.per_page,
        total: data.total,
        totalPages: data.last_page,
      },
    };
  }

  const items = payload.data?.data && Array.isArray(payload.data.data) ? payload.data.data : payload.data;
  return {
    items: Array.isArray(items) ? items : [],
    pagination: { page: 1, perPage: 15, total: Array.isArray(items) ? items.length : 0, totalPages: 1 },
  };
}

