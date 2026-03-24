// Utilities for chat message normalization and deduplication

export function normalizeMessage(raw = {}) {
  if (!raw) return null;
  const id = raw?.id ?? raw?.message_id ?? raw?.msg_id ?? null;
  const text = raw?.message ?? raw?.text ?? raw?.body ?? "";
  const created_at = raw?.created_at ?? raw?.createdAt ?? raw?.timestamp ?? null;
  const sender_id = raw?.sender_id ?? raw?.from ?? raw?.user_id ?? null;
  const chat_session_id = raw?.chat_session_id ?? raw?.session_id ?? raw?.chatSessionId ?? null;
  const is_read = raw?.is_read ?? raw?.read ?? false;

  if (id == null && !text) return null;

  return {
    id,
    message: text,
    created_at,
    sender_id,
    chat_session_id,
    is_read,
    raw,
  };
}

export function dedupeMessages(arr = []) {
  const map = new Map();
  const out = [];
  for (const m of arr) {
    try {
      const key = m?.id != null ? String(m.id) : JSON.stringify(m?.raw ?? m);
      if (!map.has(key)) {
        map.set(key, true);
        out.push(m);
      }
    } catch {
      // fallback
      out.push(m);
    }
  }
  // keep order
  return out;
}
