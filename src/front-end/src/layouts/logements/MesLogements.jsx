import { useState, useEffect } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { getMesLogements, getFileUrl } from "api/logementApi";
import { getMonAbonnement } from "api/abonnementApi";
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
  const [abonnement, setAbonnement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    Promise.all([
      getMesLogements(),
      getMonAbonnement().catch(() => null),
    ])
      .then(([logs, ab]) => {
        setLogements(logs);
        setAbonnement(ab);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false));
  }, []);

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
              <MDBox display="flex" gap={1}>
                <MDButton variant="outlined" color="warning" size="small" onClick={() => navigate("/abonnement")}>
                  <Icon sx={{ mr: 0.5 }}>card_membership</Icon>
                  Abonnement
                </MDButton>
                <MDButton variant="gradient" color="info" onClick={() => navigate("/ajouter-logement")}>
                  <Icon sx={{ mr: 0.5 }}>add</Icon>
                  Ajouter
                </MDButton>
              </MDBox>
            </MDBox>

            {abonnement && abonnement.typeAbonnement !== "GRATUIT" && (
              <Card sx={{ p: 2, mb: 2, bgcolor: "grey.100" }}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="body2" color="text">
                    <Icon fontSize="small" color="info">card_membership</Icon>&nbsp;
                    Plan: <strong>{abonnement.typeAbonnement?.replace(/_/g, " ")}</strong>
                    {abonnement.publicationsIncluses !== -1
                      ? ` — ${abonnement.publicationsRestantes} publications restantes`
                      : " — Publications illimitees"}
                  </MDTypography>
                </MDBox>
              </Card>
            )}

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
                    <Card
                      sx={{
                        cursor: "pointer",
                        "&:hover": { boxShadow: 6 },
                        border: logement.enVedette ? "2px solid #f0a500" : "none",
                      }}
                      onClick={() => navigate(`/logements/${logement.id}`)}
                    >
                      <MDBox p={2}>
                        {logement.enVedette && (
                          <Chip
                            icon={<Icon sx={{ fontSize: 14, color: "#f0a500 !important" }}>star</Icon>}
                            label="En vedette"
                            size="small"
                            sx={{ mb: 1, bgcolor: "#fff3e0", color: "#e65100" }}
                          />
                        )}
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
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default MesLogements;
