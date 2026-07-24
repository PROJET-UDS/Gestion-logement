import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
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

import { getLogementById, getFileUrl, supprimerLogement } from "api/logementApi";
import { isAuthenticated, getUserRole } from "services/authService";

const STATUT_COLORS = {
  DISPONIBLE: "success",
  LOUE: "warning",
  EN_MAINTENANCE: "info",
  INDISPONIBLE: "error",
};

const STATUT_ANNONCE_COLORS = {
  EN_ATTENTE: "warning",
  VALIDE: "success",
  REJETE: "error",
  LOUE: "info",
  SUSPENDU: "default",
  VENDU: "default",
};

function LogementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suppressionLoading, setSuppressionLoading] = useState(false);

  useEffect(() => {
    getLogementById(id)
      .then(setLogement)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSupprimer = async () => {
    setSuppressionLoading(true);
    try {
      await supprimerLogement(id);
      navigate("/mes-logements", { replace: true });
    } catch (err) {
      setErreur(err.message || "Erreur lors de la suppression");
    } finally {
      setSuppressionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mt={8} display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (erreur) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mt={8} mb={3}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <MDAlert color="error">{erreur}</MDAlert>
              <MDButton variant="gradient" color="info" onClick={() => navigate("/mes-logements")} sx={{ mt: 2 }}>
                Retour
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!logement) return null;

  const medias = logement.medias || [];
  const equipements = logement.equipements
    ? logement.equipements.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <MDBox display="flex" alignItems="center" mb={2} gap={1}>
              <IconButton onClick={() => navigate("/mes-logements")} size="small">
                <Icon>arrow_back</Icon>
              </IconButton>
              <MDTypography variant="h5" fontWeight="medium" sx={{ flexGrow: 1 }}>
                {logement.titre}
              </MDTypography>
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={() => navigate(`/modifier-logement/${logement.id}`)}
              >
                <Icon sx={{ fontSize: 16, mr: 0.5 }}>edit</Icon>
                Modifier
              </MDButton>
              <MDButton
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Icon sx={{ fontSize: 16, mr: 0.5 }}>delete</Icon>
                Supprimer
              </MDButton>
            </MDBox>

            <MDBox display="flex" gap={1} mb={3}>
              <Chip
                label={logement.statutLogement || "DISPONIBLE"}
                color={STATUT_COLORS[logement.statutLogement] || "default"}
                size="small"
              />
              {logement.statutAnnonce && (
                <Chip
                  label={logement.statutAnnonce}
                  color={STATUT_ANNONCE_COLORS[logement.statutAnnonce] || "default"}
                  size="small"
                  variant="outlined"
                />
              )}
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
                            style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 8 }}
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
                                  border: i === activePhotoIndex ? "2px solid #3498db" : "2px solid transparent",
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={getFileUrl(media.fileUrl)}
                                  alt=""
                                  style={{ width: 64, height: 48, objectFit: "cover" }}
                                />
                              </MDBox>
                            ))}
                          </MDBox>
                        )}
                      </MDBox>
                    ) : (
                      <MDBox py={8} textAlign="center" bgColor="grey-200" borderRadius="md">
                        <Icon sx={{ fontSize: 60, color: "text.disabled" }}>home</Icon>
                        <MDTypography variant="body2" color="text" mt={1}>
                          Aucune photo
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h4" fontWeight="bold" color="info" mb={1}>
                      {Number(logement.prix).toLocaleString("fr-FR")} FCFA
                    </MDTypography>
                    {logement.typeTransaction === "LOCATION" && (
                      <MDTypography variant="body2" color="text" mb={2}>
                        /mois
                      </MDTypography>
                    )}

                    <MDBox display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip icon={<Icon sx={{ fontSize: 16 }}>home</Icon>} label={logement.typeLogement} size="small" variant="outlined" />
                      <Chip icon={<Icon sx={{ fontSize: 16 }}>swap_horiz</Icon>} label={logement.typeTransaction} size="small" variant="outlined" />
                      {logement.nbPieces && (
                        <Chip icon={<Icon sx={{ fontSize: 16 }}>meeting_room</Icon>} label={`${logement.nbPieces} pièces`} size="small" variant="outlined" />
                      )}
                      {logement.superficie && (
                        <Chip icon={<Icon sx={{ fontSize: 16 }}>square_foot</Icon>} label={`${logement.superficie} m²`} size="small" variant="outlined" />
                      )}
                    </MDBox>

                    <MDBox mb={2}>
                      <MDTypography variant="caption" fontWeight="bold" color="text" textTransform="uppercase">
                        Adresse
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {logement.adresse}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {logement.ville}{logement.quartier ? `, ${logement.quartier}` : ""}
                      </MDTypography>
                    </MDBox>

                    {logement.charges > 0 && (
                      <MDBox mb={2}>
                        <MDTypography variant="caption" fontWeight="bold" color="text" textTransform="uppercase">
                          Charges
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {Number(logement.charges).toLocaleString("fr-FR")} FCFA/mois
                        </MDTypography>
                      </MDBox>
                    )}

                    {logement.noteMoyenne > 0 && (
                      <MDBox mb={2} display="flex" alignItems="center" gap={0.5}>
                        <Icon sx={{ fontSize: 18, color: "warning.main" }}>star</Icon>
                        <MDTypography variant="body2" fontWeight="medium">
                          {logement.noteMoyenne.toFixed(1)}
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Description
                </MDTypography>
                <MDTypography variant="body2" color="text" whiteSpace="pre-wrap">
                  {logement.description}
                </MDTypography>
              </MDBox>
            </Card>

            {equipements.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Equipements
                  </MDTypography>
                  <MDBox display="flex" flexWrap="wrap" gap={1}>
                    {equipements.map((eq) => (
                      <Chip key={eq} label={eq} color="info" variant="outlined" size="small" />
                    ))}
                  </MDBox>
                </MDBox>
              </Card>
            )}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">
            Voulez-vous vraiment supprimer le logement <strong>{logement?.titre}</strong> ? Cette action est irreversible.
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

export default LogementDetail;
