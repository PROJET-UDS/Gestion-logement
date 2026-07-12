import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function AjouterLogement() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Chambre");
  const [prix, setPrix] = useState("");
  const [quartier, setQuartier] = useState("");
  const [pointInteret, setPointInteret] = useState("");
  const [distanceMetres, setDistanceMetres] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!titre || !prix || !quartier) {
      setError("Merci de remplir au moins le titre, le prix et le quartier");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8083/api/logements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titre,
          type,
          prix: Number(prix),
          quartier,
          pointInteret,
          distanceMetres: distanceMetres ? Number(distanceMetres) : null,
          description,
        }),
      });

      if (response.ok) {
        setMessage("Logement ajouté avec succès !");
        setTimeout(() => navigate("/logements"), 1000);
      } else {
        setError("Erreur lors de l'ajout du logement");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  Ajouter un logement
                </MDTypography>

                <MDBox component="form" role="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="Titre de l'annonce"
                        fullWidth
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        select
                        label="Type de logement"
                        fullWidth
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        SelectProps={{ native: false }}
                      >
                        <MenuItem value="Chambre">Chambre</MenuItem>
                        <MenuItem value="Studio">Studio</MenuItem>
                        <MenuItem value="Appartement">Appartement</MenuItem>
                        <MenuItem value="Maison">Maison</MenuItem>
                      </MDInput>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="number"
                        label="Prix (FCFA)"
                        fullWidth
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="Quartier"
                        fullWidth
                        value={quartier}
                        onChange={(e) => setQuartier(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="Point d'intérêt proche (ex: Campus A)"
                        fullWidth
                        value={pointInteret}
                        onChange={(e) => setPointInteret(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="number"
                        label="Distance à pied (mètres)"
                        fullWidth
                        value={distanceMetres}
                        onChange={(e) => setDistanceMetres(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        type="text"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  {message && (
                    <MDTypography variant="caption" color="success" mt={2} display="block">
                      {message}
                    </MDTypography>
                  )}
                  {error && (
                    <MDTypography variant="caption" color="error" mt={2} display="block">
                      {error}
                    </MDTypography>
                  )}

                  <MDBox mt={3} display="flex" gap={2}>
                    <MDButton variant="gradient" color="success" type="submit">
                      Publier le logement
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      color="dark"
                      type="button"
                      onClick={() => navigate("/logements")}
                    >
                      Annuler
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AjouterLogement;