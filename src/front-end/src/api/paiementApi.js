import axios from "axios";

const API_BASE_URL = "http://localhost:8089/paiements";

const paiementApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Créer un nouveau paiement
export const creerPaiement = (data) => paiementApi.post("/", data);

// Récupérer le statut d'un paiement par son id
export const getStatutPaiement = (id) => paiementApi.get(`/${id}`);

// Récupérer l'historique des paiements
export const getHistoriquePaiements = () => paiementApi.get("/");

export default paiementApi;