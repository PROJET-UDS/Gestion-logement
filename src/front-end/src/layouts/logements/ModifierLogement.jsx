import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { getLogementById, modifierLogement } from "api/logementApi";

const TYPES_LOGEMENT = ["STUDIO", "APPARTEMENT", "MAISON", "CHAMBRE"];
const TYPES_TRANSACTION = ["LOCATION", "VENTE"];
const EQUIPEMENTS_LIST = [
  "Eau courante",
  "Electricite",
  "Wifi",
  "Parking",
  "Meuble",
  "Climatisation",
  "Gardienage",
  "Piscine",
];

function ModifierLogement() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    prix: "",
    adresse: "",
    ville: "",
    quartier: "",
    typeLogement: "",
    typeTransaction: "",
    charges: "",
    nbPieces: "",
    superficie: "",
    equipements: "",
  });

  const [statut, setStatut] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLogementById(id)
      .then((logement) => {
        setFormData({
          titre: logement.titre || "",
          description: logement.description || "",
          prix: logement.prix || "",
          adresse: logement.adresse || "",
          ville: logement.ville || "",
          quartier: logement.quartier || "",
          typeLogement: logement.typeLogement || "",
          typeTransaction: logement.typeTransaction || "",
          charges: logement.charges || "",
          nbPieces: logement.nbPieces || "",
          superficie: logement.superficie || "",
          equipements: logement.equipements || "",
        });
      })
      .catch((err) => {
        setStatut("error");
        setMessage(err.message || "Erreur lors du chargement du logement");
      })
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEquipement = (eq) => {
    const current = formData.equipements ? formData.equipements.split(",").map((s) => s.trim()) : [];
    const updated = current.includes(eq) ? current.filter((e) => e !== eq) : [...current, eq];
    setFormData({ ...formData, equipements: updated.join(", ") });
  };

  const validateForm = () => {
    if (!formData.titre.trim()) { setStatut("error"); setMessage("Le titre est obligatoire."); return false; }
    if (!formData.description.trim()) { setStatut("error"); setMessage("La description est obligatoire."); return false; }
    if (!formData.prix || Number(formData.prix) <= 0) { setStatut("error"); setMessage("Le prix doit être supérieur à 0."); return false; }
    if (!formData.adresse.trim()) { setStatut("error"); setMessage("L'adresse est obligatoire."); return false; }
    if (!formData.ville.trim()) { setStatut("error"); setMessage("La ville est obligatoire."); return false; }
    if (!formData.typeLogement) { setStatut("error"); setMessage("Sélectionnez un type de logement."); return false; }
    if (!formData.typeTransaction) { setStatut("error"); setMessage("Sélectionnez un type de transaction."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setStatut(null);

    try {
      const payload = {
        ...formData,
        prix: Number(formData.prix),
        charges: formData.charges ? Number(formData.charges) : null,
        nbPieces: formData.nbPieces ? Number(formData.nbPieces) : null,
        superficie: formData.superficie ? Number(formData.superficie) : null,
      };
      await modifierLogement(id, payload);

      setStatut("success");
      setMessage("Logement modifié avec succès !");
      setTimeout(() => navigate(`/logements/${id}`), 1500);
    } catch (error) {
      setStatut("error");
      setMessage(error.message || "Erreur lors de la modification du logement.");
    } finally {
      setLoading(false);
    }
  };

  const currentEquipements = formData.equipements ? formData.equipements.split(",").map((s) => s.trim()) : [];

  if (loadingData) {
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  Modifier le logement
                </MDTypography>

                {statut && (
                  <MDBox mb={2}>
                    <MDAlert color={statut === "success" ? "success" : "error"}>
                      {message}
                    </MDAlert>
                  </MDBox>
                )}

                <MDBox component="form" role="form" onSubmit={handleSubmit}>
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Informations generales
                  </MDTypography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12}>
                      <MDInput type="text" label="Titre du logement" name="titre" value={formData.titre} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput type="text" label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth required multiline rows={3} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput type="number" label="Prix (FCFA)" name="prix" value={formData.prix} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput type="number" label="Charges (FCFA)" name="charges" value={formData.charges} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput type="number" label="Nombre de pieces" name="nbPieces" value={formData.nbPieces} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput type="number" label="Superficie (m2)" name="superficie" value={formData.superficie} onChange={handleChange} fullWidth />
                    </Grid>
                  </Grid>

                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Localisation
                  </MDTypography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12}>
                      <MDInput type="text" label="Adresse complete" name="adresse" value={formData.adresse} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput type="text" label="Ville" name="ville" value={formData.ville} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput type="text" label="Quartier" name="quartier" value={formData.quartier} onChange={handleChange} fullWidth />
                    </Grid>
                  </Grid>

                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Type
                  </MDTypography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                      <MDInput select label="Type de logement" name="typeLogement" value={formData.typeLogement} onChange={handleChange} fullWidth required SelectProps={{ native: true }}>
                        <option value="">-- Choisir --</option>
                        {TYPES_LOGEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
                      </MDInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput select label="Type de transaction" name="typeTransaction" value={formData.typeTransaction} onChange={handleChange} fullWidth required SelectProps={{ native: true }}>
                        <option value="">-- Choisir --</option>
                        {TYPES_TRANSACTION.map((t) => <option key={t} value={t}>{t}</option>)}
                      </MDInput>
                    </Grid>
                  </Grid>

                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Equipements
                  </MDTypography>

                  <MDBox mb={3} display="flex" flexWrap="wrap" gap={1}>
                    {EQUIPEMENTS_LIST.map((eq) => (
                      <Chip
                        key={eq}
                        label={eq}
                        color={currentEquipements.includes(eq) ? "info" : "default"}
                        variant={currentEquipements.includes(eq) ? "filled" : "outlined"}
                        onClick={() => toggleEquipement(eq)}
                        clickable
                      />
                    ))}
                  </MDBox>

                  <MDBox display="flex" justifyContent="flex-end" gap={1}>
                    <MDButton variant="outlined" color="secondary" onClick={() => navigate(`/logements/${id}`)}>
                      Annuler
                    </MDButton>
                    <MDButton variant="gradient" color="info" type="submit" disabled={loading}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Enregistrer les modifications"}
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

export default ModifierLogement;
