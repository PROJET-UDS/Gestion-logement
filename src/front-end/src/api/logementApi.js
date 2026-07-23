import { getAccessToken } from "services/authService";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function creerLogement(data) {
  const response = await fetch(`${API_BASE_URL}/api/v1/logements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Erreur lors de la création du logement");
  }
  return response.json();
}

export async function getMesLogements() {
  const response = await fetch(`${API_BASE_URL}/api/v1/logements/mes-logements`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw new Error("Erreur lors du chargement des logements");
  return response.json();
}

export async function uploadPhotos(logementId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${API_BASE_URL}/api/v1/logements/${logementId}/photos`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!response.ok) throw new Error("Erreur lors de l'upload des photos");
  return response.json();
}

export async function supprimerPhoto(logementId, mediaId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/logements/${logementId}/photos/${mediaId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression de la photo");
  return response.json();
}

export async function getLogementById(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/logements/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw new Error("Logement introuvable");
  return response.json();
}

export async function getLogementsPublic() {
  const response = await fetch(`${API_BASE_URL}/api/v1/logements`);
  if (!response.ok) throw new Error("Erreur lors du chargement des logements");
  return response.json();
}

export async function rechercherLogements({ ville, prixMax, typeLogement, typeTransaction } = {}) {
  const params = new URLSearchParams();
  if (ville) params.append("ville", ville);
  if (prixMax) params.append("prixMax", prixMax);
  if (typeLogement) params.append("typeLogement", typeLogement);
  if (typeTransaction) params.append("typeTransaction", typeTransaction);

  const url = `${API_BASE_URL}/api/v1/logements/recherche${params.toString() ? "?" + params.toString() : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erreur lors de la recherche");
  return response.json();
}

export function getFileUrl(fileUrl) {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http")) return fileUrl;
  return `${API_BASE_URL}${fileUrl}`;
}
