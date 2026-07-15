import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

import PageLayout from "examples/LayoutContainers/PageLayout";

import { getLogementById, getFileUrl } from "api/logementApi";
import { creerReservation } from "api/reservationApi";
import { isAuthenticated, getUserRole } from "services/authService";

const STATUT_COLORS = {
  DISPONIBLE: "success",
  LOUE: "warning",
  EN_MAINTENANCE: "info",
  INDISPONIBLE: "error",
};

function SiteLogementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationMsg, setReservationMsg] = useState(null);
  const [reservationStatut, setReservationStatut] = useState(null);

  useEffect(() => {
    getLogementById(id)
      .then(setLogement)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReservation = async (e) => {
    e.preventDefault();
    setReservationMsg(null);

    if (!isAuthenticated()) {
      navigate("/authentification/sign-in");
      return;
    }

    if (getUserRole() === "PROPRIETAIRE") {
      setReservationStatut("error");
      setReservationMsg("Les propriétaires ne peuvent pas réserver de logements.");
      return;
    }

    if (!dateDebut || !dateFin) {
      setReservationStatut("error");
      setReservationMsg("Veuillez sélectionner les dates de début et de fin.");
      return;
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      setReservationStatut("error");
      setReservationMsg("La date de fin doit être postérieure à la date de début.");
      return;
    }

    setReservationLoading(true);
    try {
      await creerReservation({
        logementId: logement.id,
        dateDebut,
        dateFin,
      });
      setReservationStatut("success");
      setReservationMsg("Réservation créée avec succès ! Vous recevrez une confirmation.");
      setDateDebut("");
      setDateFin("");
    } catch (err) {
      setReservationStatut("error");
      setReservationMsg(err.message || "Erreur lors de la réservation.");
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ fontFamily: "sans-serif" }}>
          <nav style={{ backgroundColor: "#1a1a2e", padding: "20px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", width: "100%", top: 0, zIndex: 1000 }}>
            <h1 onClick={() => navigate("/")} style={{ color: "#f0a500", fontSize: "30px", fontWeight: "bold", margin: 0, cursor: "pointer" }}>SearcHome</h1>
          </nav>
          <MDBox display="flex" justifyContent="center" py={20}>
            <CircularProgress />
          </MDBox>
        </div>
      </PageLayout>
    );
  }

  if (erreur || !logement) {
    return (
      <PageLayout>
        <div style={{ fontFamily: "sans-serif" }}>
          <nav style={{ backgroundColor: "#1a1a2e", padding: "20px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", width: "100%", top: 0, zIndex: 1000 }}>
            <h1 onClick={() => navigate("/")} style={{ color: "#f0a500", fontSize: "30px", fontWeight: "bold", margin: 0, cursor: "pointer" }}>SearcHome</h1>
          </nav>
          <MDBox mt={12} px={6}>
            <MDAlert color="error">{erreur || "Logement introuvable"}</MDAlert>
            <MDButton variant="gradient" color="info" onClick={() => navigate("/annonces")} sx={{ mt: 2 }}>
              Retour aux annonces
            </MDButton>
          </MDBox>
        </div>
      </PageLayout>
    );
  }

  const medias = logement.medias || [];
  const equipements = logement.equipements
    ? logement.equipements.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <PageLayout>
      <div style={{ fontFamily: "sans-serif", margin: 0, padding: 0 }}>
        <nav style={{ backgroundColor: "#1a1a2e", padding: "20px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", width: "100%", top: 0, zIndex: 1000 }}>
          <h1 onClick={() => navigate("/")} style={{ color: "#f0a500", fontSize: "30px", fontWeight: "bold", margin: 0, cursor: "pointer" }}>SearcHome</h1>
          <div>
            <a href="/" style={{ color: "white", marginRight: 20, textDecoration: "none" }}>Accueil</a>
            <a href="/annonces" style={{ color: "#f0a500", marginRight: 20, textDecoration: "none" }}>Annonces</a>
          </div>
        </nav>

        <div style={{ paddingTop: 100, minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
          <MDBox px={6} py={4}>
            <MDBox display="flex" alignItems="center" mb={3} gap={1}>
              <Icon sx={{ cursor: "pointer", fontSize: 24, color: "text.main" }} onClick={() => navigate("/annonces")}>arrow_back</Icon>
              <MDTypography variant="h4" fontWeight="bold">
                {logement.titre}
              </MDTypography>
            </MDBox>

            <MDBox display="flex" gap={1} mb={3}>
              <Chip label={logement.statutLogement || "DISPONIBLE"} color={STATUT_COLORS[logement.statutLogement] || "default"} size="small" />
              <Chip label={logement.typeLogement} size="small" variant="outlined" />
              <Chip label={logement.typeTransaction} size="small" variant="outlined" />
            </MDBox>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card>
                  <MDBox p={2}>
                    {medias.length > 0 ? (
                      <MDBox>
                        <MDBox mb={1}>
                          <img
                            src={getFileUrl(medias[activePhotoIndex]?.fileUrl)}
                            alt={logement.titre}
                            style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 8 }}
                          />
                        </MDBox>
                        {medias.length > 1 && (
                          <MDBox display="flex" gap={0.5} overflow="auto" pb={1}>
                            {medias.map((media, i) => (
                              <MDBox
                                key={media.id || i}
                                onClick={() => setActivePhotoIndex(i)}
                                sx={{
                                  cursor: "pointer",
                                  border: i === activePhotoIndex ? "2px solid #f0a500" : "2px solid transparent",
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <img src={getFileUrl(media.fileUrl)} alt="" style={{ width: 72, height: 54, objectFit: "cover" }} />
                              </MDBox>
                            ))}
                          </MDBox>
                        )}
                      </MDBox>
                    ) : (
                      <MDBox py={10} textAlign="center" bgColor="grey-200" borderRadius="md">
                        <Icon sx={{ fontSize: 80, color: "text.disabled" }}>home</Icon>
                        <MDTypography variant="body2" color="text" mt={1}>Aucune photo</MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>

                <Card sx={{ mt: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>Description</MDTypography>
                    <MDTypography variant="body2" color="text" whiteSpace="pre-wrap" lineHeight={1.8}>
                      {logement.description}
                    </MDTypography>
                  </MDBox>
                </Card>

                {equipements.length > 0 && (
                  <Card sx={{ mt: 3 }}>
                    <MDBox p={3}>
                      <MDTypography variant="h6" fontWeight="medium" mb={2}>Equipements</MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {equipements.map((eq) => (
                          <Chip key={eq} label={eq} color="info" variant="outlined" size="small" />
                        ))}
                      </MDBox>
                    </MDBox>
                  </Card>
                )}

                <Card sx={{ mt: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>Localisation</MDTypography>
                    <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                      <Icon sx={{ fontSize: 20, color: "info.main" }}>location_on</Icon>
                      <MDTypography variant="body2">{logement.adresse}</MDTypography>
                    </MDBox>
                    <MDTypography variant="body2" color="text">
                      {logement.ville}{logement.quartier ? `, ${logement.quartier}` : ""}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ position: "sticky", top: 100 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h3" fontWeight="bold" color="info" mb={0.5}>
                      {Number(logement.prix).toLocaleString("fr-FR")} FCFA
                    </MDTypography>
                    {logement.typeTransaction === "LOCATION" && (
                      <MDTypography variant="body2" color="text" mb={2}>/mois</MDTypography>
                    )}

                    <MDBox display="flex" flexWrap="wrap" gap={1} mb={3}>
                      {logement.nbPieces && (
                        <Chip icon={<Icon sx={{ fontSize: 16 }}>meeting_room</Icon>} label={`${logement.nbPieces} pièces`} size="small" variant="outlined" />
                      )}
                      {logement.superficie && (
                        <Chip icon={<Icon sx={{ fontSize: 16 }}>square_foot</Icon>} label={`${logement.superficie} m²`} size="small" variant="outlined" />
                      )}
                      {logement.charges > 0 && (
                        <Chip label={`${Number(logement.charges).toLocaleString("fr-FR")} FCFA charges`} size="small" variant="outlined" />
                      )}
                    </MDBox>

                    {logement.typeTransaction === "LOCATION" && (
                      <MDBox component="form" onSubmit={handleReservation}>
                        <MDTypography variant="h6" fontWeight="medium" mb={2}>Réserver ce logement</MDTypography>

                        {reservationMsg && (
                          <MDBox mb={2}>
                            <MDAlert color={reservationStatut === "success" ? "success" : "error"} dismissible onClose={() => setReservationMsg(null)}>
                              {reservationMsg}
                            </MDAlert>
                          </MDBox>
                        )}

                        <TextField
                          fullWidth
                          size="small"
                          label="Date de début"
                          type="date"
                          value={dateDebut}
                          onChange={(e) => setDateDebut(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: new Date().toISOString().split("T")[0] }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Date de fin"
                          type="date"
                          value={dateFin}
                          onChange={(e) => setDateFin(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: dateDebut || new Date().toISOString().split("T")[0] }}
                          sx={{ mb: 3 }}
                        />

                        {dateDebut && dateFin && new Date(dateFin) > new Date(dateDebut) && (
                          <MDBox mb={2} p={2} bgColor="grey-100" borderRadius="md">
                            <MDTypography variant="body2" color="text" mb={0.5}>Durée du séjour</MDTypography>
                            <MDTypography variant="h6" fontWeight="medium">
                              {Math.ceil((new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24))} jours
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mt={1}>Coût estimé</MDTypography>
                            <MDTypography variant="h6" fontWeight="bold" color="info">
                              {Math.ceil((new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24) * Number(logement.prix) / 30).toLocaleString("fr-FR")} FCFA
                            </MDTypography>
                          </MDBox>
                        )}

                        <MDButton
                          variant="gradient"
                          color="info"
                          type="submit"
                          fullWidth
                          disabled={reservationLoading}
                        >
                          {reservationLoading ? <CircularProgress size={20} color="inherit" /> : "Réserver maintenant"}
                        </MDButton>

                        {!isAuthenticated() && (
                          <MDTypography variant="caption" color="text" textAlign="center" display="block" mt={2}>
                            Connectez-vous pour réserver
                          </MDTypography>
                        )}
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        </div>

        <footer style={{ backgroundColor: "#1a1a2e", color: "white", padding: "50px", textAlign: "center" }}>
          <h2 style={{ color: "#f0a500", marginBottom: 20 }}>SearcHome</h2>
          <p style={{ color: "#666", fontSize: 14 }}>© 2026 SearcHome - Tous droits réservés</p>
        </footer>
      </div>
    </PageLayout>
  );
}

export default SiteLogementDetail;
