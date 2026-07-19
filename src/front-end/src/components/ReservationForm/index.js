import { useState, useEffect } from "react";
import { creerReservation, payerReservation } from "api/reservationApi";
import { isAuthenticated, getUserId } from "services/authService";

const METHODES_payment = [
  { id: "ORANGE_MONEY", label: "Orange Money", icon: "🟠", color: "#FF6600" },
  { id: "MTN_MOMO", label: "MTN MoMo", icon: "🟡", color: "#FFCC00" },
  { id: "WAVE", label: "Wave", icon: "🔵", color: "#1DC3F0" },
  { id: "VISA", label: "Carte Visa", icon: "💳", color: "#1A1F71" },
];

const formatMontant = (montant) =>
  new Intl.NumberFormat("fr-CM").format(montant);

export default function ReservationForm({ logement, onSuccess, onClose }) {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [methodepayment, setMethodepayment] = useState("");
  const [montantReservation, setMontantReservation] = useState(0);
  const [montantRestant, setMontantRestant] = useState(0);
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reservationId, setReservationId] = useState(null);

  const userId = getUserId();

  useEffect(() => {
    if (logement?.prix) {
      const prix = Number(logement.prix);
      setMontantReservation(Math.round(prix * 0.1));
      setMontantRestant(prix - Math.round(prix * 0.1));
    }
  }, [logement]);

  const handleCreerReservation = async () => {
    if (!dateDebut || !dateFin) {
      setError("Veuillez sélectionner les dates de réservation");
      return;
    }
    if (new Date(dateFin) <= new Date(dateDebut)) {
      setError("La date de fin doit être après la date de début");
      return;
    }
    if (!methodepayment) {
      setError("Veuillez choisir une méthode de payment");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const reservation = await creerReservation({
        logementId: logement.id,
        clientId: parseInt(userId),
        dateDebut,
        dateFin,
        methodepayment,
      });

      setReservationId(reservation.id);
      setStep("payment");
    } catch (err) {
      setError(err.message || "Erreur lors de la création de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handlePayer = async () => {
    setLoading(true);
    setError("");

    try {
      await payerReservation(reservationId, methodepayment);
      setStep("succes");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Erreur lors du payment");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (step === "succes") {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Réservation Confirmée !</h2>
            <p style={styles.successText}>
              Votre réservation pour <strong>{logement.titre}</strong> a été confirmée.
            </p>
            <div style={styles.successDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Montant payé (10%) :</span>
                <span style={styles.detailValue}>{formatMontant(montantReservation)} FCFA</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Montant restant :</span>
                <span style={styles.detailValue}>{formatMontant(montantRestant)} FCFA</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Période :</span>
                <span style={styles.detailValue}>{dateDebut} → {dateFin}</span>
              </div>
            </div>
            <p style={styles.successNote}>
              Le logement est maintenant marqué comme réservé. Vous pouvez payer le reste du montant à tout moment.
            </p>
            <button onClick={onClose} style={styles.btnPrimary}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>payment de la Réservation</h2>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.paymentSummary}>
            <div style={styles.paymentMontant}>
              <span style={styles.paymentLabel}>Montant à payer</span>
              <span style={styles.paymentValue}>{formatMontant(montantReservation)} FCFA</span>
              <span style={styles.paymentPercent}>10% du prix du logement</span>
            </div>

            <div style={styles.logementInfo}>
              <span style={styles.logementTitre}>{logement.titre}</span>
              <span style={styles.logementLocalisation}>{logement.adresse}, {logement.ville}</span>
              <span style={styles.logementPrix}>Prix total : {formatMontant(Number(logement.prix))} FCFA</span>
            </div>
          </div>

          <div style={styles.methodeSection}>
            <p style={styles.methodeTitle}>Méthode de payment</p>
            <div style={styles.methodeList}>
              {METHODES_payment.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMethodepayment(m.id)}
                  style={{
                    ...styles.methodeCard,
                    borderColor: methodepayment === m.id ? m.color : "#E5E7EB",
                    backgroundColor: methodepayment === m.id ? `${m.color}10` : "white",
                  }}
                >
                  <span style={styles.methodeIcon}>{m.icon}</span>
                  <span style={styles.methodeLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            onClick={handlePayer}
            disabled={loading || !methodepayment}
            style={{
              ...styles.btnPrimary,
              opacity: loading || !methodepayment ? 0.5 : 1,
            }}
          >
            {loading ? "payment en cours..." : `Payer ${formatMontant(montantReservation)} FCFA`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Réserver ce Logement</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.logementCard}>
          <img
            src={logement.image || (logement.medias && logement.medias[0]?.fileUrl) || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"}
            alt={logement.titre}
            style={styles.logementImage}
          />
          <div style={styles.logementCardBody}>
            <h3 style={styles.logementCardTitle}>{logement.titre}</h3>
            <p style={styles.logementCardAdresse}>{logement.adresse}, {logement.ville}</p>
            <p style={styles.logementCardPrix}>
              {formatMontant(Number(logement.prix))} FCFA
              <span style={styles.logementCardType}>
                {logement.typeTransaction === "LOCATION" ? "/mois" : ""}
              </span>
            </p>
          </div>
        </div>

        <div style={styles.formSection}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Date de début</label>
            <input
              type="date"
              value={dateDebut}
              min={today}
              onChange={(e) => setDateDebut(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Date de fin</label>
            <input
              type="date"
              value={dateFin}
              min={dateDebut || today}
              onChange={(e) => setDateFin(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.prixRecap}>
          <div style={styles.prixRow}>
            <span>Prix du logement</span>
            <span style={styles.prixBold}>{formatMontant(Number(logement.prix))} FCFA</span>
          </div>
          <div style={styles.prixRow}>
            <span>Dépôt de réservation (10%)</span>
            <span style={{...styles.prixBold, color: "#E67E22"}}>{formatMontant(montantReservation)} FCFA</span>
          </div>
          <div style={{...styles.prixRow, borderTop: "2px solid #E5E7EB", paddingTop: 8}}>
            <span>Reste à payer après visite</span>
            <span style={styles.prixBold}>{formatMontant(montantRestant)} FCFA</span>
          </div>
        </div>

        <div style={styles.methodeSection}>
          <p style={styles.methodeTitle}>Choisir la méthode de payment du dépôt</p>
          <div style={styles.methodeList}>
            {METHODES_payment.map((m) => (
              <div
                key={m.id}
                onClick={() => setMethodepayment(m.id)}
                style={{
                  ...styles.methodeCard,
                  borderColor: methodepayment === m.id ? m.color : "#E5E7EB",
                  backgroundColor: methodepayment === m.id ? `${m.color}10` : "white",
                }}
              >
                <span style={styles.methodeIcon}>{m.icon}</span>
                <span style={styles.methodeLabel}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          onClick={handleCreerReservation}
          disabled={loading || !dateDebut || !dateFin || !methodepayment}
          style={{
            ...styles.btnPrimary,
            opacity: loading || !dateDebut || !dateFin || !methodepayment ? 0.5 : 1,
          }}
        >
          {loading ? "Réservation en cours..." : `Réserver pour ${formatMontant(montantReservation)} FCFA`}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    maxWidth: 520,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1F2937",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#9CA3AF",
    padding: 4,
  },
  logementCard: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
  },
  logementImage: {
    width: 100,
    height: 80,
    objectFit: "cover",
    borderRadius: 8,
  },
  logementCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  logementCardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1F2937",
    margin: 0,
  },
  logementCardAdresse: {
    fontSize: 13,
    color: "#6B7280",
    margin: 0,
  },
  logementCardPrix: {
    fontSize: 18,
    fontWeight: 700,
    color: "#059669",
    margin: 0,
  },
  logementCardType: {
    fontSize: 13,
    fontWeight: 400,
    color: "#6B7280",
  },
  formSection: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  },
  prixRecap: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    border: "1px solid #BBF7D0",
  },
  prixRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    fontSize: 14,
    color: "#374151",
  },
  prixBold: {
    fontWeight: 700,
    fontSize: 15,
  },
  methodeSection: {
    marginBottom: 24,
  },
  methodeTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 12,
  },
  methodeList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  methodeCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    border: "2px solid #E5E7EB",
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  methodeIcon: {
    fontSize: 22,
  },
  methodeLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#1F2937",
  },
  btnPrimary: {
    width: "100%",
    padding: "14px 24px",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  error: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
    border: "1px solid #FECACA",
  },
  successContainer: {
    textAlign: "center",
    padding: "20px 0",
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    backgroundColor: "#ECFDF5",
    color: "#059669",
    fontSize: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    border: "3px solid #059669",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1F2937",
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 20,
  },
  successDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    textAlign: "left",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #E5E7EB",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1F2937",
  },
  successNote: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginBottom: 20,
  },
  paymentSummary: {
    marginBottom: 24,
  },
  paymentMontant: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
    marginBottom: 16,
    border: "1px solid #FCD34D",
  },
  paymentLabel: {
    display: "block",
    fontSize: 14,
    color: "#92400E",
    marginBottom: 4,
  },
  paymentValue: {
    display: "block",
    fontSize: 32,
    fontWeight: 700,
    color: "#92400E",
    marginBottom: 4,
  },
  paymentPercent: {
    display: "block",
    fontSize: 13,
    color: "#B45309",
  },
  logementInfo: {
    textAlign: "center",
  },
  logementTitre: {
    display: "block",
    fontSize: 16,
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: 4,
  },
  logementLocalisation: {
    display: "block",
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  logementPrix: {
    display: "block",
    fontSize: 14,
    color: "#059669",
    fontWeight: 500,
  },
};
