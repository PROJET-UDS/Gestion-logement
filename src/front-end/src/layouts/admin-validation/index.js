import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { getLogementsEnAttente, validerLogement, rejeterLogement } from "api/validationApi";
import { getFileUrl } from "api/logementApi";

function AdminValidation() {
  const [enAttente, setEnAttente] = useState([]);
  const [traites, setTraites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLogement, setSelectedLogement] = useState(null);
  const [motif, setMotif] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLogements = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLogementsEnAttente();
      setEnAttente(data || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des logements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogements();
  }, []);

  const handleValider = async (id) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await validerLogement(id);
      setSuccess("Logement valide avec succes");
      const logement = enAttente.find((l) => l.id === id);
      if (logement) {
        setEnAttente((prev) => prev.filter((l) => l.id !== id));
        setTraites((prev) => [{ ...logement, statutAnnonce: "PUBLIEE" }, ...prev]);
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la validation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectDialog = (logement) => {
    setSelectedLogement(logement);
    setMotif("");
    setRejectDialogOpen(true);
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedLogement(null);
    setMotif("");
  };

  const handleRejeter = async () => {
    if (!motif.trim()) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await rejeterLogement(selectedLogement.id, motif);
      setSuccess("Logement rejete avec succes");
      setEnAttente((prev) => prev.filter((l) => l.id !== selectedLogement.id));
      setTraites((prev) => [{ ...selectedLogement, statutAnnonce: "REJETEE" }, ...prev]);
      handleCloseRejectDialog();
    } catch (err) {
      setError(err.message || "Erreur lors du rejet");
    } finally {
      setActionLoading(false);
    }
  };

  const renderLogementCard = (logement, showActions) => {
    const photoUrl =
      logement.medias && logement.medias.length > 0 ? getFileUrl(logement.medias[0].fileUrl) : null;

    return (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={logement.titre}
            style={{ width: "100%", height: 180, objectFit: "cover", borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
          />
        ) : (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ height: 180, backgroundColor: "#1a1a2e", borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
          >
            <Icon sx={{ fontSize: 50, color: "#f0a500" }}>home</Icon>
          </MDBox>
        )}
        <MDBox p={2} display="flex" flexDirection="column" flex={1}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 15 }}>
              {logement.titre || "Sans titre"}
            </MDTypography>
            {logement.statutAnnonce && (
              <Chip
                label={logement.statutAnnonce}
                size="small"
                color={
                  logement.statutAnnonce === "PUBLIEE"
                    ? "success"
                    : logement.statutAnnonce === "REJETEE"
                    ? "error"
                    : "warning"
                }
                variant="outlined"
              />
            )}
          </MDBox>
          <MDTypography variant="body2" color="text" mb={0.5}>
            <Icon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }}>location_on</Icon>
            {logement.ville || "N/A"}
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={0.5}>
            <strong>{logement.prix ? `${Number(logement.prix).toLocaleString("fr-FR")} FCFA` : "N/A"}</strong>
            {logement.typeTransaction === "LOCATION" ? " /mois" : ""}
          </MDTypography>
          <MDTypography variant="caption" color="text" mb={0.5}>
            {logement.typeLogement} - {logement.nbPieces ? `${logement.nbPieces} pièce(s)` : ""} - {logement.superficie ? `${logement.superficie} m²` : ""}
          </MDTypography>
          <MDTypography variant="caption" color="text" mb={1}>
            Proprietaire: {logement.proprietaireId ? logement.proprietaireId.substring(0, 8) + "..." : "N/A"}
          </MDTypography>
          <MDBox mt="auto" display="flex" gap={1} flexWrap="wrap">
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={() => window.open(`/logements/${logement.id}`, "_blank")}
            >
              <Icon sx={{ mr: 0.3, fontSize: 16 }}>visibility</Icon>
              Détails
            </MDButton>
            {showActions && (
              <>
                <MDButton
                  variant="gradient"
                  color="success"
                  size="small"
                  disabled={actionLoading}
                  onClick={() => handleValider(logement.id)}
                >
                  <Icon sx={{ mr: 0.3, fontSize: 16 }}>check</Icon>
                  Valider
                </MDButton>
                <MDButton
                  variant="gradient"
                  color="error"
                  size="small"
                  disabled={actionLoading}
                  onClick={() => handleOpenRejectDialog(logement)}
                >
                  <Icon sx={{ mr: 0.3, fontSize: 16 }}>close</Icon>
                  Rejeter
                </MDButton>
              </>
            )}
          </MDBox>
        </MDBox>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Validation des logements
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Logements en attente de validation par un administrateur
          </MDTypography>
        </MDBox>

        {error && (
          <MDBox mb={2}>
            <MDAlert color="error" dismissible>
              {error}
            </MDAlert>
          </MDBox>
        )}

        {success && (
          <MDBox mb={2}>
            <MDAlert color="success" dismissible>
              {success}
            </MDAlert>
          </MDBox>
        )}

        {loading ? (
          <MDBox display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </MDBox>
        ) : (
          <>
            <MDTypography variant="h5" fontWeight="medium" mb={2}>
              En attente ({enAttente.length})
            </MDTypography>
            {enAttente.length === 0 ? (
              <MDBox py={3} textAlign="center" mb={4}>
                <MDTypography variant="body2" color="text">
                  Aucun logement en attente
                </MDTypography>
              </MDBox>
            ) : (
              <Grid container spacing={3} mb={4}>
                {enAttente.map((logement) => (
                  <Grid item xs={12} sm={6} lg={4} key={logement.id}>
                    {renderLogementCard(logement, true)}
                  </Grid>
                ))}
              </Grid>
            )}

            {traites.length > 0 && (
              <>
                <MDTypography variant="h5" fontWeight="medium" mb={2}>
                  Deja traites ({traites.length})
                </MDTypography>
                <Grid container spacing={3}>
                  {traites.map((logement) => (
                    <Grid item xs={12} sm={6} lg={4} key={logement.id}>
                      {renderLogementCard(logement, false)}
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}

        <Dialog open={rejectDialogOpen} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
          <DialogTitle>Motif du rejet</DialogTitle>
          <DialogContent>
            <MDBox mt={1}>
              <TextField
                autoFocus
                fullWidth
                multiline
                rows={3}
                label="Motif (obligatoire)"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                error={rejectDialogOpen && !motif.trim()}
                helperText={rejectDialogOpen && !motif.trim() ? "Le motif est obligatoire" : ""}
              />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton variant="text" color="dark" onClick={handleCloseRejectDialog}>
              Annuler
            </MDButton>
            <MDButton
              variant="gradient"
              color="error"
              onClick={handleRejeter}
              disabled={!motif.trim() || actionLoading}
            >
              Confirmer le rejet
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminValidation;
