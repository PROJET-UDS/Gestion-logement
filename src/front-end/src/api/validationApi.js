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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

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

export async function getLogementsEnAttente() {
  return apiRequest("/api/v1/logements/en-attente-validation");
}

export async function validerLogement(id) {
  return apiRequest(`/api/v1/logements/${id}/valider`, {
    method: "PATCH",
  });
}

export async function rejeterLogement(id, motif) {
  return apiRequest(`/api/v1/logements/${id}/rejeter?motif=${encodeURIComponent(motif)}`, {
    method: "PATCH",
  });
}
