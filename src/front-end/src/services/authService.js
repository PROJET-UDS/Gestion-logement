export const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "http://localhost:8089";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ROLE_KEY = "userRole";
const USER_ID_KEY = "userId";
const LEGACY_TOKEN_KEY = "token";

export const AUTHENTICATED_ROLES = ["CLIENT", "PROPRIETAIRE", "ADMIN"];

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUserRole() {
  return localStorage.getItem(ROLE_KEY) || decodeJwtPayload(getAccessToken())?.role || "VISITEUR";
}

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY) || decodeJwtPayload(getAccessToken())?.userId || decodeJwtPayload(getAccessToken())?.sub;
}

export function isAuthenticated() {
  const token = getAccessToken();
  return Boolean(token && !isTokenExpired(token));
}

export function getDefaultRouteForRole(role = getUserRole()) {
  if (AUTHENTICATED_ROLES.includes(role)) {
    return "/dashboard";
  }
  return "/";
}

export function saveAuthSession(authData) {
  const accessToken = authData.accessToken || authData.token;
  if (!accessToken) {
    throw new Error("Token d'acces absent dans la reponse d'authentification");
  }

  const role = authData.role || decodeJwtPayload(accessToken)?.role || "VISITEUR";
  const userId = authData.userId || decodeJwtPayload(accessToken)?.userId || decodeJwtPayload(accessToken)?.sub;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(LEGACY_TOKEN_KEY, accessToken);
  localStorage.setItem(ROLE_KEY, role);
  if (userId) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  }

  if (authData.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
  }

  return { accessToken, refreshToken: authData.refreshToken, role, userId };
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(credentials) {
  return authRequest("/auth/login", credentials);
}

export async function register(payload) {
  return authRequest("/auth/register", payload);
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (err) {
    // Ignore errors on logout
  }
  clearAuthSession();
}

async function authRequest(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || "Erreur d'authentification");
  }
  return data;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }
  return payload.exp * 1000 <= Date.now();
}

function decodeJwtPayload(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
    return JSON.parse(window.atob(padded));
  } catch (error) {
    return null;
  }
}
