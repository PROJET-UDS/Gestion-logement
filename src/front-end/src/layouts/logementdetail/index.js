import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function LogementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [logement, setLogement] = useState(null);
  const [avis, setAvis] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLogement = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8083/api/logements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setLogement(data);
        } else {
          setMessage("Logement introuvable");
        }
      } catch (err) {
        setMessage("Erreur de connexion au serveur");
      }
    };

    const fetchAvis = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8083/api/logements/${id}/avis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAvis(data.content || data);
        }
      } catch (err) {
        console.log("Impossible de charger les avis pour le moment");
      }
    };

    fetchLogement();
    fetchAvis();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce logement ?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8083/api/logements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        navigate("/logements");
      } else {
        setMessage("Erreur lors de la suppression");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const handleSignaler = async (motif) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8083/api/logements/${id}/signalements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motif }),
      });
      if (response.ok) {
        setMessage("Signalement envoyé, merci de votre vigilance.");
      } else {
        setMessage("Erreur lors de l'envoi du signalement");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const couleurStatut = (statut) => {
    if (statut === "SUSPENDU") return "error";
    if (statut === "ACTIF") return "success";
    return "secondary";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <MDBox mb={3}>
        <Grid container spacing={3}>
          {/* Carte informations du logement */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                {message && (
                  <MDTypography variant="caption" color="info" mb={2} display="block">
                    {message}
                  </MDTypography>
                )}

                {logement ? (
                  <>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h5" fontWeight="medium">
                        {logement.titre}
                      </MDTypography>
                      <Chip
                        label={logement.statut || "ACTIF"}
                        color={couleurStatut(logement.statut)}
                      />
                    </MDBox>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="button" color="text">Type</MDTypography>
                        <MDTypography variant="body2">{logement.type}</MDTypography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="button" color="text">Prix</MDTypography>
                        <MDTypography variant="body2">{logement.prix} FCFA</MDTypography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="button" color="text">Quartier</MDTypography>
                        <MDTypography variant="body2">{logement.quartier}</MDTypography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="button" color="text">Proximité</MDTypography>
                        <MDTypography variant="body2">
                          {logement.pointInteret
                            ? `${logement.pointInteret} (${logement.distanceMetres || "?"} m)`
                            : "-"}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="button" color="text">Note moyenne</MDTypography>
                        <MDTypography variant="body2">
                          {logement.noteMoyenne ? `⭐ ${logement.noteMoyenne.toFixed(1)}` : "Aucun avis"}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="button" color="text">Signalements</MDTypography>
                        <MDTypography variant="body2">
                          {logement.nombreSignalements || 0}
                        </MDTypography>
                      </Grid>
                      {logement.description && (
                        <Grid item xs={12}>
                          <MDTypography variant="button" color="text">Description</MDTypography>
                          <MDTypography variant="body2">{logement.description}</MDTypography>
                        </Grid>
                      )}
                    </Grid>

                    <MDBox mt={3} display="flex" gap={2}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => navigate(`/logements/${id}/modifier`)}
                      >
                        Modifier
                      </MDButton>
                      <MDButton variant="gradient" color="error" onClick={handleDelete}>
                        Supprimer
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="dark"
                        onClick={() => navigate("/logements")}
                      >
                        Retour
                      </MDButton>
                    </MDBox>

                    <MDBox mt={3}>
                      <MDTypography variant="button" color="text" mb={1} display="block">
                        Signaler ce logement :
                      </MDTypography>
                      <MDButton
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleSignaler("ARNAQUE")}
                        style={{ marginRight: "10px" }}
                      >
                        Arnaque
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleSignaler("DEJA_LOUE")}
                      >
                        Déjà loué
                      </MDButton>
                    </MDBox>
                  </>
                ) : (
                  <MDTypography variant="body2" color="text">
                    Chargement du logement...
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Carte des avis */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Avis des étudiants
                </MDTypography>
                {avis.length === 0 ? (
                  <MDTypography variant="body2" color="text">
                    Aucun avis pour le moment
                  </MDTypography>
                ) : (
                  avis.map((a, index) => (
                    <MDBox
                      key={a.id || index}
                      mb={2}
                      pb={2}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <MDTypography variant="button" fontWeight="medium">
                        {"⭐".repeat(a.note || 0)} — {a.auteur || "Étudiant"}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {a.commentaire}
                      </MDTypography>
                    </MDBox>
                  ))
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default LogementDetail;