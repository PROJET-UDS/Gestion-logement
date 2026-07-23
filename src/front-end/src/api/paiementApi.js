import { authHeaders } from "services/authService";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "";

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

export async function initierPaiement(data) {
  return apiRequest("/api/payments/initiate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPaiementById(id) {
  return apiRequest(`/api/payments/${id}`);
}

export async function getPaiementsParReservation(reservationId) {
  return apiRequest(`/api/payments/reservation/${reservationId}`);
}

export async function getPaiementsParUser(userId) {
  return apiRequest(`/api/payments/user/${userId}`);
}

export async function updatePaiementStatus(id, status) {
  return apiRequest(`/api/payments/${id}/status?status=${encodeURIComponent(status)}`, {
    method: "PUT",
  });
}

export async function payByCard(data) {
  return apiRequest("/api/payments/card", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
