// Velocity OS — frontend HTTP client + useApi hook.
//
// Same-origin in production (unified Cloud Run service serves both the
// SPA and the API). In dev, Vite's proxy forwards /api/* to the FastAPI
// backend on :8081 — see vite.config.js. So pages always fetch relative
// paths like "/api/v1/objectives".

import { useCallback, useEffect, useRef, useState } from "react";

export class ApiError extends Error {
  constructor(message, { status, detail, path }) {
    super(message);
    this.status = status;
    this.detail = detail;
    this.path = path;
  }
}

/** Low-level fetch wrapper that JSON-encodes the body, parses JSON
 *  responses, and throws ApiError on non-2xx. Use this directly for
 *  mutations (POST / PATCH / DELETE). */
export async function apiFetch(path, opts = {}) {
  const { method = "GET", body, signal, headers: headerOverrides } = opts;
  const headers = { Accept: "application/json", ...headerOverrides };
  let payload;
  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(path, { method, headers, body: payload, signal });
  // 204 No Content has no body.
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || res.statusText;
    throw new ApiError(`${method} ${path} → ${res.status} ${detail}`, {
      status: res.status,
      detail,
      path
    });
  }
  return data;
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

/** React hook for GET endpoints. Returns { data, loading, error, refresh }.
 *  Re-fetches when `path` changes. Cancels in-flight requests on unmount. */
export function useApi(path, opts = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // Stable opts ref so the effect doesn't re-fire on every render.
  const optsKey = JSON.stringify(opts);
  const abortRef = useRef(null);

  const refresh = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState(s => ({ ...s, loading: true, error: null }));
    apiFetch(path, { ...opts, signal: ctrl.signal })
      .then(data => {
        if (!ctrl.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (ctrl.signal.aborted) return;
        setState({ data: null, loading: false, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, optsKey]);

  useEffect(() => {
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  return { ...state, refresh };
}

/** Convenience wrappers — same as apiFetch but with the method baked in. */
export const apiPost   = (path, body) => apiFetch(path, { method: "POST", body });
export const apiPatch  = (path, body) => apiFetch(path, { method: "PATCH", body });
export const apiDelete = (path)       => apiFetch(path, { method: "DELETE" });

/** POST a body and consume an SSE stream. The backend wire format is one
 *  JSON object per `data: …\n\n` line, with the object's `type` field
 *  driving dispatch. Known types from `routes/chat.py`:
 *
 *    {type:"text",   text}              streaming token
 *    {type:"counts", pro, con, concern} synthesis-only stance counts
 *    {type:"done",   model, usage, stopReason}
 *    {type:"error",  detail}            stable slug; final event
 *
 *  Returns the AbortController so callers can cancel mid-stream (e.g.
 *  unmount). On non-2xx responses, calls onError with an ApiError. */
export function apiStream(path, body, { onEvent, onError, signal } = {}) {
  const ctrl = new AbortController();
  const composedSignal = signal
    ? combineSignals(signal, ctrl.signal)
    : ctrl.signal;

  (async () => {
    let res;
    try {
      res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify(body || {}),
        signal: composedSignal
      });
    } catch (err) {
      if (err?.name !== "AbortError") onError?.(err);
      return;
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const data = text ? safeJson(text) : null;
      const detail = (data && (data.detail || data.message)) || res.statusText;
      onError?.(new ApiError(`POST ${path} → ${res.status} ${detail}`, {
        status: res.status, detail, path
      }));
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) { onError?.(new Error("no_response_body")); return; }
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE event delimiter is a blank line.
        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const line = raw.startsWith("data: ") ? raw.slice(6) : raw.replace(/^data:\s*/, "");
          if (!line.trim()) continue;
          const event = safeJson(line);
          if (event) onEvent?.(event);
        }
      }
    } catch (err) {
      if (err?.name !== "AbortError") onError?.(err);
    }
  })();

  return ctrl;
}

function combineSignals(a, b) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.any) {
    return AbortSignal.any([a, b]);
  }
  // Fallback for older runtimes (Vitest under some versions).
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  a.addEventListener("abort", onAbort);
  b.addEventListener("abort", onAbort);
  return ctrl.signal;
}
