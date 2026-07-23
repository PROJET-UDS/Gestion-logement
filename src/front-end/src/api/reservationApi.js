import { getAccessToken } from "services/authService";

const API_BASE_URL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE_URL) ||
  "http://localhost:8089";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function creerReservation(data) {
  const response = await fetch(`${API_BASE_URL}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Erreur lors de la réservation");
  }
  return response.json();
}

export async function payerReservation(id, methodepayment) {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/${id}/payer?methodepayment=${encodeURIComponent(
      methodepayment
    )}`,
    {
      method: "POST",
      headers: { ...authHeaders() },
    }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Erreur lors du paiement");
  }
  return response.json();
}

export async function getMesReservations() {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/mes-reservations`,
    {
      headers: { ...authHeaders() },
    }
  );
  if (!response.ok)
    throw new Error("Erreur lors du chargement des réservations");
  return response.json();
}

export async function getReservationsProprietaire() {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/proprietaire`,
    {
      headers: { ...authHeaders() },
    }
  );
  if (!response.ok)
    throw new Error("Erreur lors du chargement des réservations reçues");
  return response.json();
}

export async function getToutesReservations() {
  const response = await fetch(`${API_BASE_URL}/api/reservations`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok)
    throw new Error("Erreur lors du chargement de toutes les réservations");
  return response.json();
}

export async function annulerReservation(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/${id}/annuler`,
    {
      method: "PATCH",
      headers: { ...authHeaders() },
    }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Erreur lors de l'annulation");
  }
  return response.json();
}

export async function payerLeReste(id, methode) {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/${id}/payer-le-reste?methodepayment=${encodeURIComponent(
      methode
    )}`,
    {
      method: "POST",
      headers: { ...authHeaders() },
    }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Erreur lors du paiement du reste");
  }
  return response.json();
}

export async function rembourserReservation(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/${id}/rembourser`,
    {
      method: "POST",
      headers: { ...authHeaders() },
    }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Erreur lors du remboursement");
  }
  return response.json();
}
