import { authHeaders } from "services/authService";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "http://localhost:8089";

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let errorData = null;
    if (contentType.includes("application/json")) {
      errorData = await response.json();
    }
    throw new Error(errorData?.message || `Erreur HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function getMonAbonnement() {
  return apiRequest("/api/v1/abonnements/moi");
}

export async function souscrireAbonnement(data) {
  return apiRequest("/api/v1/abonnements/souscrire", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function peutPublier() {
  return apiRequest("/api/v1/abonnements/peut-publier");
}

export async function passerEnVedette(data) {
  return apiRequest("/api/v1/abonnements/vedette", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function retirerDeVedette(logementId) {
  return apiRequest(`/api/v1/abonnements/vedette/${logementId}`, {
    method: "DELETE",
  });
}

export async function getMesVedettes() {
  return apiRequest("/api/v1/abonnements/vedette/mes-vedettes");
}

export async function compterVedettes() {
  return apiRequest("/api/v1/abonnements/vedette/compter");
}
