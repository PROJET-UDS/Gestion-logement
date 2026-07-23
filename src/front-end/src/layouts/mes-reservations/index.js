import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getMesReservations,
  payerLeReste,
  rembourserReservation,
  annulerReservation,
} from "api/reservationApi";
import { getUserId } from "services/authService";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const formatMontant = (montant) =>
  new Intl.NumberFormat("fr-CM").format(Number(montant));

const STATUT_COLORS = {
  EN_ATTENTE: { bg: "#FEF3C7", text: "#92400E", label: "En attente" },
  CONFIRMEE: { bg: "#ECFDF5", text: "#065F46", label: "Confirmée" },
  ANNULEE: { bg: "#FEE2E2", text: "#991B1B", label: "Annulée" },
  TERMINEE: { bg: "#E0E7FF", text: "#3730A3", label: "Terminée" },
};

const payment_COLORS = {
  EN_ATTENTE: { bg: "#FEF3C7", text: "#92400E", label: "En attente" },
  PAYE: { bg: "#ECFDF5", text: "#065F46", label: "Payé" },
  REMBOURSE: { bg: "#FEE2E2", text: "#991B1B", label: "Remboursé" },
};

export default function MesReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const userId = getUserId();

  useEffect(() => {
    if (userId) {
      chargerReservations();
    }
  }, [userId]);

  const chargerReservations = async () => {
    setLoading(true);
    try {
      const data = await getMesReservations();
      setReservations(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  const handlePayerLeReste = async (id) => {
    setActionLoading(id);
    try {
      await payerLeReste(id, "ORANGE_MONEY");
      await chargerReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRembourser = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir demander un remboursement ?"))
      return;
    setActionLoading(id);
    try {
      await rembourserReservation(id);
      await chargerReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?"))
      return;
    setActionLoading(id);
    try {
      await annulerReservation(id);
      await chargerReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Chargement de vos réservations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Mes Réservations</h1>
          <p style={styles.subtitle}>
            {reservations.length} réservation
            {reservations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={styles.closeError}>
              ✕
            </button>
          </div>
        )}

        {reservations.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={styles.emptyTitle}>Aucune réservation</h3>
            <p style={styles.emptyText}>
              Vous n'avez pas encore de réservation. Explorez nos logements
              disponibles et faites votre première réservation !
            </p>
            <Link to="/annonces" style={styles.btnPrimary}>
              Voir les logements
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {reservations.map((res) => {
              const statutInfo =
                STATUT_COLORS[res.statut] || STATUT_COLORS.EN_ATTENTE;
              const paymentInfo =
                payment_COLORS[res.paymentStatut] || payment_COLORS.EN_ATTENTE;

              return (
                <div key={res.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardHeaderLeft}>
                      <span
                        style={{
                          ...styles.statutBadge,
                          backgroundColor: statutInfo.bg,
                          color: statutInfo.text,
                        }}
                      >
                        {statutInfo.label}
                      </span>
                      <span
                        style={{
                          ...styles.statutBadge,
                          backgroundColor: paymentInfo.bg,
                          color: paymentInfo.text,
                        }}
                      >
                        payment: {paymentInfo.label}
                      </span>
                    </div>
                    <span style={styles.cardId}>#{res.id}</span>
                  </div>

                  <h3 style={styles.cardTitle}>
                    {res.logementTitre || "Logement #" + res.logementId}
                  </h3>
                  <p style={styles.cardAdresse}>
                    {res.logementAdresse || "Adresse non disponible"}
                  </p>

                  <div style={styles.cardDates}>
                    <div style={styles.dateItem}>
                      <span style={styles.dateLabel}>Début</span>
                      <span style={styles.dateValue}>{res.dateDebut}</span>
                    </div>
                    <div style={styles.dateDivider}>→</div>
                    <div style={styles.dateItem}>
                      <span style={styles.dateLabel}>Fin</span>
                      <span style={styles.dateValue}>{res.dateFin}</span>
                    </div>
                  </div>

                  {res.joursRestants > 0 && res.statut !== "ANNULEE" && (
                    <div style={styles.joursRestants}>
                      <span style={styles.joursNumber}>
                        {res.joursRestants}
                      </span>
                      <span style={styles.joursLabel}>
                        jour{res.joursRestants > 1 ? "s" : ""} restant
                        {res.joursRestants > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  <div style={styles.prixSection}>
                    <div style={styles.prixRow}>
                      <span style={styles.prixLabel}>Prix du logement</span>
                      <span style={styles.prixValue}>
                        {formatMontant(res.prixLogement)} FCFA
                      </span>
                    </div>
                    <div style={styles.prixRow}>
                      <span style={styles.prixLabel}>Dépôt payé (10%)</span>
                      <span style={{ ...styles.prixValue, color: "#059669" }}>
                        {formatMontant(res.montantReservation)} FCFA
                      </span>
                    </div>
                    {res.montantRestant > 0 && (
                      <div style={styles.prixRow}>
                        <span style={styles.prixLabel}>Reste à payer</span>
                        <span style={{ ...styles.prixValue, color: "#E67E22" }}>
                          {formatMontant(res.montantRestant)} FCFA
                        </span>
                      </div>
                    )}
                  </div>

                  {res.methodepayment && (
                    <p style={styles.methode}>Méthode: {res.methodepayment}</p>
                  )}

                  <div style={styles.actions}>
                    {res.paymentStatut === "PAYE" && res.montantRestant > 0 && (
                      <button
                        onClick={() => handlePayerLeReste(res.id)}
                        disabled={actionLoading === res.id}
                        style={styles.btnPayer}
                      >
                        {actionLoading === res.id ? "..." : "Payer le reste"}
                      </button>
                    )}

                    {res.paymentStatut === "PAYE" &&
                      res.statut !== "ANNULEE" && (
                        <button
                          onClick={() => handleRembourser(res.id)}
                          disabled={actionLoading === res.id}
                          style={styles.btnRembourser}
                        >
                          {actionLoading === res.id
                            ? "..."
                            : "Demander remboursement"}
                        </button>
                      )}

                    {res.paymentStatut === "EN_ATTENTE" &&
                      res.statut === "EN_ATTENTE" && (
                        <button
                          onClick={() => handleAnnuler(res.id)}
                          disabled={actionLoading === res.id}
                          style={styles.btnAnnuler}
                        >
                          {actionLoading === res.id ? "..." : "Annuler"}
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  container: {
    padding: "24px 32px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1F2937",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    margin: 0,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #E5E7EB",
    borderTopColor: "#059669",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    padding: "12px 16px",
    borderRadius: 10,
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #FECACA",
  },
  closeError: {
    background: "none",
    border: "none",
    color: "#DC2626",
    cursor: "pointer",
    fontSize: 18,
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    border: "1px solid #E5E7EB",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1F2937",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    maxWidth: 400,
    margin: "0 auto 24px",
  },
  btnPrimary: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#059669",
    color: "white",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    textDecoration: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  statutBadge: {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  cardId: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: 500,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1F2937",
    margin: "0 0 4px 0",
  },
  cardAdresse: {
    fontSize: 14,
    color: "#6B7280",
    margin: "0 0 16px 0",
  },
  cardDates: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 16,
  },
  dateItem: {
    textAlign: "center",
  },
  dateLabel: {
    display: "block",
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
  },
  dateValue: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#1F2937",
  },
  dateDivider: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  joursRestants: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    padding: "8px 16px",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    border: "1px solid #BFDBFE",
  },
  joursNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1D4ED8",
  },
  joursLabel: {
    fontSize: 14,
    color: "#1D4ED8",
  },
  prixSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  prixRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #F3F4F6",
  },
  prixLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  prixValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1F2937",
  },
  methode: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    fontStyle: "italic",
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  btnPayer: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnRembourser: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "white",
    color: "#DC2626",
    border: "1px solid #DC2626",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnAnnuler: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "white",
    color: "#6B7280",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
};
