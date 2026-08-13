const BASE = (import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "") + "/api";

export function getToken() {
  return localStorage.getItem("ws_token");
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem("ws_user")); } catch { return null; }
}
export function setSession(token, user) {
  localStorage.setItem("ws_token", token);
  localStorage.setItem("ws_user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("ws_token");
  localStorage.removeItem("ws_user");
}

async function req(path, { method = "GET", body, isForm } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    if (!res.ok) throw new Error("Request failed.");
    return res;
  }
  const data = await res.json();
  if (!res.ok) throw new Error((data.error || "Something went wrong.") + (data.debug ? " [" + data.debug + "]" : ""));
  return data;
}

export const api = {
  login: (email, password) => req("/auth/login", { method: "POST", body: { email, password } }),
  register: (payload) => req("/auth/register", { method: "POST", body: payload }),
  wards: () => req("/wards"),
  categories: () => req("/categories"),

  listApps: (scope) => req("/applications" + (scope ? `?scope=${scope}` : "")),
  getApp: (id) => req(`/applications/${id}`),
  submitApp: (payload) => req("/applications", { method: "POST", body: payload }),
  decide: (id, payload) => req(`/applications/${id}/decision`, { method: "POST", body: payload }),

  uploadDoc: (appId, file, label) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("label", label);
    return req(`/documents/${appId}`, { method: "POST", body: fd, isForm: true });
  },
  docLink: (docId) => req(`/documents/${docId}/link`),

  summary: () => req("/reports/summary"),
  reportUrl: (kind, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return `${BASE}/reports/${kind}${q ? "?" + q : ""}`;
  },
};

export const ROLE_LABEL = {
  applicant: "Applicant",
  cdf_manager: "CDF Manager",
  clerk: "Clerk",
  chairman: "Chairman",
  mp: "Member of Parliament",
};
