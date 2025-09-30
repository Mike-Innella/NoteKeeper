// src/auth.js
const TOK_KEY = "nk_token";
const NAME_KEY = "nk_name";
const ID_KEY = "nk_user_id";
const EMAIL_KEY = "nk_email";

export function getToken() {
  return localStorage.getItem(TOK_KEY) || "";
}
export function setToken(token) {
  localStorage.setItem(TOK_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOK_KEY);
}
export function isAuthed() {
  return !!getToken();
}

export function getUser() {
  // Only return user data if there's a valid token
  if (!getToken()) {
    return null;
  }
  return {
    id: localStorage.getItem(ID_KEY) || "",
    name: localStorage.getItem(NAME_KEY) || "",
    email: localStorage.getItem(EMAIL_KEY) || "",
  };
}
export function setUser({ id, name, email }) {
  localStorage.setItem(ID_KEY, id);
  localStorage.setItem(NAME_KEY, name);
  if (email) localStorage.setItem(EMAIL_KEY, email);
}
export function clearUser() {
  localStorage.removeItem(ID_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
