// src/api.js
import { getToken } from "./auth";

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function authHeaders() {
  const tok = getToken();
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

async function http(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(opts.headers || {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text || path}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : undefined;
}

export const api = {
  health: () => http("/"),
  
  // Authentication
  register: (email, password) =>
    http("/auth/register", { 
      method: "POST", 
      body: JSON.stringify({ email, password }) 
    }),
  login: (email, password) =>
    http("/auth/login", { 
      method: "POST", 
      body: JSON.stringify({ email, password }) 
    }),
  
  // Notes
  listNotes: () => http("/notes"),
  createNote: (note) =>
    http("/notes", { method: "POST", body: JSON.stringify(note) }),
  updateNote: (id, patch) =>
    http(`/notes/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  deleteNote: (id) => http(`/notes/${id}`, { method: "DELETE" }),
};
