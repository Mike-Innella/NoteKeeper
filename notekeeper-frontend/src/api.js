// src/api.js
import { getToken } from "./auth";

// Get the API URL from environment variable or default to empty string
const API_URL = import.meta.env.VITE_API_URL || "";

// Remove any trailing slashes to avoid double slashes in URLs
const BASE = API_URL.replace(/\/$/, "");

function authHeaders() {
  const tok = getToken();
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

async function http(path, opts = {}) {
  // Construct the full URL
  const url = BASE ? `${BASE}${path}` : path;
  
  try {
    const res = await fetch(url, {
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
  } catch (error) {
    // Log the error for debugging
    console.error(`API Error: ${error.message}`, { url, path, BASE });
    throw error;
  }
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
