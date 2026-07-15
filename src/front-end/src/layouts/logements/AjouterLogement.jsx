import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

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

import { creerLogement, uploadPhotos } from "api/logementApi";

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

function AjouterLogement() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [statut, setStatut] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
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
      const logement = await creerLogement(payload);

      if (selectedFiles.length > 0) {
        await uploadPhotos(logement.id, selectedFiles);
      }

      setStatut("success");
      setMessage("Logement créé avec succès !");
      setTimeout(() => navigate("/mes-logements"), 1500);
    } catch (error) {
      setStatut("error");
      setMessage(error.message || "Erreur lors de la création du logement.");
    } finally {
      setLoading(false);
    }
  };

  const currentEquipements = formData.equipements ? formData.equipements.split(",").map((s) => s.trim()) : [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  Nouveau logement
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
                      <MDInput type="number" label="Loyer (FCFA)" name="prix" value={formData.prix} onChange={handleChange} fullWidth required />
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

                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Photos (max 10)
                  </MDTypography>

                  <MDBox mb={3}>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                    <MDButton variant="outlined" color="info" onClick={() => fileInputRef.current?.click()} sx={{ mb: 2 }}>
                      Ajouter des photos
                    </MDButton>

                    {previewUrls.length > 0 && (
                      <Grid container spacing={1}>
                        {previewUrls.map((url, i) => (
                          <Grid item xs={4} sm={3} md={2} key={i}>
                            <MDBox position="relative">
                              <img src={url} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
                              <IconButton
                                size="small"
                                onClick={() => removeFile(i)}
                                sx={{ position: "absolute", top: -8, right: -8, bgcolor: "error.main", color: "white", "&:hover": { bgcolor: "error.dark" } }}
                              >
                                <span style={{ fontSize: 14 }}>X</span>
                              </IconButton>
                            </MDBox>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </MDBox>

                  <MDBox display="flex" justifyContent="flex-end">
                    <MDButton variant="gradient" color="info" type="submit" disabled={loading} sx={{ mr: 1 }}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Publier le logement"}
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
