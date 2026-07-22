import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import {
  getMesLogements,
  getFileUrl,
} from "api/logementApi";
import {
  getMesVedettes,
  passerEnVedette,
  retirerDeVedette,
  compterVedettes,
} from "api/abonnementApi";

function PasserEnVedette() {
  const [logements, setLogements] = useState([]);
  const [vedettes, setVedettes] = useState([]);
  const [nbVedettes, setNbVedettes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLogement, setSelectedLogement] = useState(null);
  const [typeVedette, setTypeVedette] = useState("MENSUEL");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [logs, veds, count] = await Promise.all([
        getMesLogements(),
        getMesVedettes(),
        compterVedettes(),
      ]);
      setLogements(logs);
      setVedettes(veds);
      setNbVedettes(count.count || 0);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const vedetteLogementIds = new Set(vedettes.map((v) => v.logementId));
  const logementsDisponibles = logements.filter(
    (l) => !vedetteLogementIds.has(l.id) && l.statutAnnonce !== "ARCHIVEE"
  );

  const handleOpenDialog = (logement) => {
    if (nbVedettes >= 4) {
      setMessage("Limite de 4 logements en vedette atteinte ce mois.");
      return;
    }
    setSelectedLogement(logement);
    setOpenDialog(true);
  };

  const handleConfirmer = async () => {
    setProcessing(true);
    setMessage("");
    try {
      await passerEnVedette({
        logementId: selectedLogement.id,
        typeVedette,
        montantPaye: typeVedette === "MENSUEL" ? 1000 : 9000,
        paymentRef: "SIMULATED",
      });
      setOpenDialog(false);
      setSelectedLogement(null);
      setMessage(`${selectedLogement.titre} est maintenant en vedette !`);
      await loadData();
    } catch (err) {
      setMessage(err.message || "Erreur lors de la mise en vedette");
    } finally {
      setProcessing(false);
    }
  };

  const handleRetirer = async (logementId) => {
    if (!window.confirm("Retirer ce logement de la vedette ?")) return;
    try {
      await retirerDeVedette(logementId);
      setMessage("Logement retire de la vedette.");
      await loadData();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} textAlign="center">
          <MDTypography variant="h6" color="text">Chargement...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">
              Passer en Vedette
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {nbVedettes}/4 logements en vedette ce mois
            </MDTypography>
          </MDBox>
          <MDButton variant="outlined" color="dark" onClick={() => navigate("/abonnement")}>
            Retour
          </MDButton>
        </MDBox>

        {message && (
          <Card sx={{ p: 2, mb: 3 }}>
            <MDTypography variant="caption" color={message.includes("Erreur") || message.includes("Limite") ? "error" : "success"} fontWeight="medium">
              {message}
            </MDTypography>
          </Card>
        )}

        {vedettes.length > 0 && (
          <>
            <MDTypography variant="h6" fontWeight="bold" mb={1} color="warning">
              <Icon fontSize="small">star</Icon> Mes logements en vedette
            </MDTypography>
            <Grid container spacing={2} mb={4}>
              {vedettes.map((ved) => (
                <Grid item xs={12} md={6} lg={4} key={ved.id}>
                  <Card sx={{ p: 2, border: "2px solid", borderColor: "warning.main" }}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="start">
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="bold">
                          {ved.titreLogement}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {ved.typeVedette === "MENSUEL" ? "1 mois" : "1 an"} - {ved.montantPaye} FCFA
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          Jusqu'au {new Date(ved.dateFin).toLocaleDateString("fr-FR")}
                        </MDTypography>
                      </MDBox>
                      <Icon fontSize="small" color="warning">star</Icon>
                    </MDBox>
                    <MDButton
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => handleRetirer(ved.logementId)}
                      sx={{ mt: 1 }}
                    >
                      Retirer
                    </MDButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <MDTypography variant="h6" fontWeight="bold" mb={1}>
          Selectionner un logement a mettre en vedette
        </MDTypography>
        <Grid container spacing={2}>
          {logementsDisponibles.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 3, textAlign: "center" }}>
                <MDTypography variant="body2" color="text">
                  {logements.length === 0
                    ? "Vous n'avez pas encore de logement."
                    : "Tous vos logements sont deja en vedette."}
                </MDTypography>
              </Card>
            </Grid>
          )}
          {logementsDisponibles.map((logement) => (
            <Grid item xs={12} md={6} lg={4} key={logement.id}>
              <Card sx={{ p: 2, height: "100%" }}>
                <MDBox display="flex" gap={2}>
                  <MDAvatar
                    src={logement.medias?.[0] ? getFileUrl(logement.medias[0].fileUrl) : ""}
                    size="lg"
                    variant="rounded"
                  />
                  <MDBox flex={1}>
                    <MDTypography variant="h6" fontWeight="bold" fontSize="0.9rem">
                      {logement.titre}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      {logement.ville} - {logement.prix?.toLocaleString()} FCFA
                    </MDTypography>
                    <MDBox mt={1}>
                      <MDButton
                        variant="gradient"
                        color="warning"
                        size="small"
                        fullWidth
                        disabled={nbVedettes >= 4}
                        onClick={() => handleOpenDialog(logement)}
                      >
                        <Icon fontSize="small">star</Icon>&nbsp; Mettre en vedette
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mettre en vedette</DialogTitle>
        <DialogContent>
          {selectedLogement && (
            <MDBox pt={1}>
              <Card sx={{ p: 2, mb: 2, bgcolor: "grey.100" }}>
                <MDTypography variant="h6" fontWeight="bold">
                  {selectedLogement.titre}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {selectedLogement.ville} - {selectedLogement.prix?.toLocaleString()} FCFA
                </MDTypography>
              </Card>
              <MDInput
                select
                label="Duree"
                fullWidth
                value={typeVedette}
                onChange={(e) => setTypeVedette(e.target.value)}
              >
                <MenuItem value="MENSUEL">1 mois - 1 000 FCFA</MenuItem>
                <MenuItem value="ANNUEL">1 an - 9 000 FCFA (25% d'economie)</MenuItem>
              </MDInput>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenDialog(false)} color="dark">
            Annuler
          </MDButton>
          <MDButton onClick={handleConfirmer} color="warning" disabled={processing}>
            {processing ? "Traitement..." : "Confirmer"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default PasserEnVedette;
