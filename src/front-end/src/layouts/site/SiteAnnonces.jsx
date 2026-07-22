import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import PageLayout from "examples/LayoutContainers/PageLayout";

import { getLogementsPublic, rechercherLogements, getFileUrl } from "api/logementApi";

const VILLES = ["", "Yaoundé", "Douala", "Bafoussam", "Bamenda", "Garoua", "Maroua"];
const TYPES_LOGEMENT = ["", "STUDIO", "APPARTEMENT", "MAISON", "CHAMBRE"];
const TYPES_TRANSACTION = ["", "LOCATION", "VENTE"];

const STATUT_COLORS = {
  DISPONIBLE: "success",
  LOUE: "warning",
  EN_MAINTENANCE: "info",
  INDISPONIBLE: "error",
};

function SiteAnnonces() {
  const navigate = useNavigate();
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [filtres, setFiltres] = useState({
    ville: "",
    typeLogement: "",
    typeTransaction: "",
    prixMax: "",
  });

  const chargerLogements = async (f) => {
    setLoading(true);
    setErreur(null);
    try {
      const hasFilter = f.ville || f.typeLogement || f.typeTransaction || f.prixMax;
      const data = hasFilter
        ? await rechercherLogements({
            ville: f.ville || undefined,
            typeLogement: f.typeLogement || undefined,
            typeTransaction: f.typeTransaction || undefined,
            prixMax: f.prixMax || undefined,
          })
        : await getLogementsPublic();
      setLogements(data);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerLogements(filtres);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltreChange = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    chargerLogements(filtres);
  };

  return (
    <PageLayout>
      <div style={{ fontFamily: "sans-serif", margin: 0, padding: 0 }}>
        <nav style={{ backgroundColor: "#1a1a2e", padding: "20px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", width: "100%", top: 0, zIndex: 1000 }}>
          <h1 onClick={() => navigate("/")} style={{ color: "#f0a500", fontSize: "30px", fontWeight: "bold", margin: 0, cursor: "pointer" }}>SearcHome</h1>
          <div>
            <a href="/" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}>Accueil</a>
            <a href="/annonces" style={{ color: "#f0a500", marginRight: "20px", textDecoration: "none" }}>Annonces</a>
            <a href="/#apropos" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}>A propos</a>
            <a href="/#contact" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}>Contact</a>
          </div>
        </nav>

        <div style={{ paddingTop: 100, minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
          <MDBox px={6} py={4}>
            <MDTypography variant="h4" fontWeight="bold" mb={1}>
              Nos Propriétés
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={4}>
              Découvrez nos logements disponibles à travers tout le Cameroun
            </MDTypography>

            <Card sx={{ mb: 4, p: 3 }}>
              <MDBox component="form" onSubmit={handleSearch} display="flex" gap={2} flexWrap="wrap" alignItems="end">
                <TextField select size="small" label="Ville" name="ville" value={filtres.ville} onChange={handleFiltreChange} sx={{ minWidth: 150 }}>
                  <MenuItem value="">Toutes les villes</MenuItem>
                  {VILLES.filter(Boolean).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Type" name="typeLogement" value={filtres.typeLogement} onChange={handleFiltreChange} sx={{ minWidth: 150 }}>
                  <MenuItem value="">Tous les types</MenuItem>
                  {TYPES_LOGEMENT.filter(Boolean).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Transaction" name="typeTransaction" value={filtres.typeTransaction} onChange={handleFiltreChange} sx={{ minWidth: 150 }}>
                  <MenuItem value="">Toutes</MenuItem>
                  {TYPES_TRANSACTION.filter(Boolean).map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Prix max (FCFA)" name="prixMax" value={filtres.prixMax} onChange={handleFiltreChange} type="number" sx={{ minWidth: 150 }} />
                <MDButton variant="gradient" color="info" type="submit" sx={{ height: 40 }}>
                  <Icon sx={{ fontSize: 18, mr: 0.5 }}>search</Icon>
                  Rechercher
                </MDButton>
              </MDBox>
            </Card>

            {erreur && (
              <MDBox mb={3}>
                <div style={{ backgroundColor: "#fdecea", color: "#611a15", padding: "12px 16px", borderRadius: 8 }}>
                  {erreur}
                </div>
              </MDBox>
            )}

            {loading ? (
              <MDBox display="flex" justifyContent="center" py={10}>
                <CircularProgress />
              </MDBox>
            ) : logements.length === 0 ? (
              <Card>
                <MDBox p={6} textAlign="center">
                  <Icon sx={{ fontSize: 60, color: "text.disabled" }}>search_off</Icon>
                  <MDTypography variant="h6" color="text" mt={2}>
                    Aucun logement trouvé
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mt={1}>
                    Essayez de modifier vos critères de recherche
                  </MDTypography>
                </MDBox>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {logements.map((logement) => (
                  <Grid item xs={12} sm={6} md={4} key={logement.id}>
                    <Card
                      sx={{
                        position: "relative",
                        cursor: "pointer",
                        "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
                        transition: "all 0.2s",
                        border: logement.enVedette ? "2px solid #f0a500" : "none",
                      }}
                      onClick={() => navigate(`/annonces/${logement.id}`)}
                    >
                      {logement.enVedette && (
                        <MDBox
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            zIndex: 1,
                            bgcolor: "#f0a500",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Icon sx={{ fontSize: 14 }}>star</Icon>
                          <MDTypography variant="caption" color="white" fontWeight="bold">
                            En vedette
                          </MDTypography>
                        </MDBox>
                      )}
                      {logement.medias && logement.medias.length > 0 ? (
                        <img
                          src={getFileUrl(logement.medias[0].fileUrl)}
                          alt={logement.titre}
                          style={{ width: "100%", height: 200, objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: 200, backgroundColor: "#e3e3e3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon sx={{ fontSize: 50, color: "#bbb" }}>home</Icon>
                        </div>
                      )}
                      <MDBox p={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                          <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: "1rem", lineHeight: 1.3 }}>
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
                            {logement.typeTransaction === "LOCATION" && (
                              <MDTypography component="span" variant="caption" color="text">/mois</MDTypography>
                            )}
                          </MDTypography>
                          {logement.nbPieces && (
                            <MDTypography variant="caption" color="text">
                              {logement.nbPieces} pièces
                            </MDTypography>
                          )}
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
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

export default SiteAnnonces;
