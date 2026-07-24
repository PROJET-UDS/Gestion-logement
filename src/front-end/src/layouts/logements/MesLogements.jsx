import { useState, useEffect } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { getMesLogements, getFileUrl, supprimerLogement } from "api/logementApi";
import { useNavigate } from "react-router-dom";

const STATUT_COLORS = {
  DISPONIBLE: "success",
  LOUE: "warning",
  EN_MAINTENANCE: "info",
  INDISPONIBLE: "error",
};

function MesLogements() {
  const navigate = useNavigate();
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logementASupprimer, setLogementASupprimer] = useState(null);
  const [suppressionLoading, setSuppressionLoading] = useState(false);

  useEffect(() => {
    getMesLogements()
      .then(setLogements)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSupprimer = async () => {
    if (!logementASupprimer) return;
    setSuppressionLoading(true);
    try {
      await supprimerLogement(logementASupprimer.id);
      setLogements((prev) => prev.filter((l) => l.id !== logementASupprimer.id));
      setDeleteDialogOpen(false);
      setLogementASupprimer(null);
    } catch (err) {
      setErreur(err.message || "Erreur lors de la suppression");
    } finally {
      setSuppressionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={30} lg={8}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDTypography variant="h5" fontWeight="medium">
                Mes logements
              </MDTypography>
              <MDButton variant="gradient" color="info" onClick={() => navigate("/ajouter-logement")}>
                <Icon sx={{ mr: 0.5 }}>add</Icon>
                Ajouter
              </MDButton>
            </MDBox>

            {erreur && (
              <MDBox mb={2}>
                <MDAlert color="error">{erreur}</MDAlert>
              </MDBox>
            )}

            {loading ? (
              <MDBox display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </MDBox>
            ) : logements.length === 0 ? (
              <Card>
                <MDBox p={4} textAlign="center">
                  <MDTypography variant="h6" color="text" mb={2}>
                    Aucun logement
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={3}>
                    Vous n&apos;avez pas encore publie de logement.
                  </MDTypography>
                  <MDButton variant="gradient" color="info" onClick={() => navigate("/ajouter-logement")}>
                    Creer mon premier logement
                  </MDButton>
                </MDBox>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {logements.map((logement) => (
                  <Grid item xs={12} sm={6} key={logement.id}>
                    <Card sx={{ "&:hover": { boxShadow: 6 } }}>
                      <MDBox p={2} sx={{ cursor: "pointer" }} onClick={() => navigate(`/logements/${logement.id}`)}>
                        {logement.medias && logement.medias.length > 0 ? (
                          <MDBox mb={1}>
                            <img
                              src={getFileUrl(logement.medias[0].fileUrl)}
                              alt={logement.titre}
                              style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }}
                            />
                          </MDBox>
                        ) : (
                          <MDBox mb={1} p={3} textAlign="center" bgColor="grey-200" borderRadius="md">
                            <Icon sx={{ fontSize: 40, color: "text.disabled" }}>home</Icon>
                          </MDBox>
                        )}

                        <MDBox display="flex" justifyContent="space-between" alignItems="start">
                          <MDTypography variant="h6" fontWeight="medium" sx={{ lineHeight: 1.3 }}>
                            {logement.titre}
                          </MDTypography>
                          <Chip
                            label={logement.statutLogement || "DISPONIBLE"}
                            color={STATUT_COLORS[logement.statutLogement] || "default"}
                            size="small"
                          />
                        </MDBox>

                        <MDTypography variant="body2" color="text" mb={0.5}>
                          {logement.ville}{logement.quartier ? `, ${logement.quartier}` : ""}
                        </MDTypography>

                        <MDTypography variant="body2" color="text" mb={1}>
                          {logement.adresse}
                        </MDTypography>

                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDTypography variant="h6" fontWeight="bold" color="info">
                            {Number(logement.prix).toLocaleString("fr-FR")} FCFA
                            {logement.typeTransaction === "LOCATION" && <MDTypography component="span" variant="caption" color="text">/mois</MDTypography>}
                          </MDTypography>
                          {logement.nbPieces && (
                            <MDTypography variant="caption" color="text">
                              {logement.nbPieces} pieces
                            </MDTypography>
                          )}
                        </MDBox>
                      </MDBox>

                      <MDBox display="flex" justifyContent="flex-end" gap={1} px={2} pb={2}>
                        <MDButton
                          variant="outlined"
                          color="info"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); navigate(`/modifier-logement/${logement.id}`); }}
                        >
                          <Icon sx={{ fontSize: 16, mr: 0.5 }}>edit</Icon>
                          Modifier
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); setLogementASupprimer(logement); setDeleteDialogOpen(true); }}
                        >
                          <Icon sx={{ fontSize: 16, mr: 0.5 }}>delete</Icon>
                          Supprimer
                        </MDButton>
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">
            Voulez-vous vraiment supprimer le logement <strong>{logementASupprimer?.titre}</strong> ? Cette action est irreversible.
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Annuler
          </MDButton>
          <MDButton onClick={handleSupprimer} color="error" disabled={suppressionLoading}>
            {suppressionLoading ? <CircularProgress size={20} /> : "Supprimer"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default MesLogements;
