import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { PublicFooter, PublicHeader } from "components/PublicSiteChrome";
import PageLayout from "examples/LayoutContainers/PageLayout";
import {
  getFileUrl,
  getLogementsPublic,
  rechercherLogements,
} from "api/logementApi";

const VILLES = [
  "Dschang",
  "Yaoundé",
  "Douala",
  "Bafoussam",
  "Bamenda",
  "Garoua",
  "Maroua",
];
const TYPES_LOGEMENT = ["STUDIO", "APPARTEMENT", "MAISON", "CHAMBRE"];
const TYPES_TRANSACTION = ["LOCATION", "VENTE"];

const TYPE_LABELS = {
  STUDIO: "Studio",
  APPARTEMENT: "Appartement",
  MAISON: "Maison",
  CHAMBRE: "Chambre",
};

const TRANSACTION_LABELS = {
  LOCATION: "Location",
  VENTE: "Vente",
};

const STATUT_COLORS = {
  DISPONIBLE: "success",
  LOUE: "warning",
  EN_MAINTENANCE: "info",
  INDISPONIBLE: "error",
};

function SiteAnnonces() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = {
    ville: searchParams.get("ville") || "",
    typeLogement: searchParams.get("typeLogement") || "",
    typeTransaction: searchParams.get("typeTransaction") || "",
    prixMax: searchParams.get("prixMax") || "",
  };
  const [filtres, setFiltres] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const chargerLogements = useCallback(async (filters) => {
    setLoading(true);
    setErreur("");
    try {
      const hasFilter = Object.values(filters).some(Boolean);
      const data = hasFilter
        ? await rechercherLogements({
            ville: filters.ville || undefined,
            typeLogement: filters.typeLogement || undefined,
            typeTransaction: filters.typeTransaction || undefined,
            prixMax: filters.prixMax || undefined,
          })
        : await getLogementsPublic();
      setLogements(Array.isArray(data) ? data : []);
    } catch (error) {
      setLogements([]);
      setErreur(
        error.message === "Failed to fetch"
          ? "Le service des logements est momentanément inaccessible."
          : error.message || "Impossible de charger les annonces."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerLogements(appliedFilters);
  }, [appliedFilters, chargerLogements]);

  const handleFiltreChange = (event) => {
    setFiltres((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const applyFiltersToUrl = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    applyFiltersToUrl(filtres);
    setAppliedFilters({ ...filtres });
  };

  const resetFilters = () => {
    const emptyFilters = {
      ville: "",
      typeLogement: "",
      typeTransaction: "",
      prixMax: "",
    };
    setFiltres(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchParams({}, { replace: true });
  };

  const openLogement = (id) => navigate(`/annonces/${id}`);

  return (
    <PageLayout>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PublicHeader active="annonces" />

        <main>
          <MDBox
            pt={18}
            pb={12}
            px={{ xs: 2, md: 4 }}
            position="relative"
            sx={{
              color: "#fff",
              backgroundImage:
                "linear-gradient(100deg, rgba(16,24,43,.96), rgba(16,24,43,.62)), url('/images/background.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <MDBox maxWidth="1180px" mx="auto">
              <MDTypography
                variant="overline"
                sx={{
                  color: "#f2a900",
                  fontWeight: 800,
                  letterSpacing: ".12em",
                }}
              >
                Catalogue SearchHome
              </MDTypography>
              <MDTypography
                variant="h2"
                color="white"
                fontWeight="bold"
                mt={0.5}
              >
                Trouvez votre prochain logement
              </MDTypography>
              <MDTypography
                variant="body1"
                mt={1.5}
                sx={{ maxWidth: 610, color: "rgba(255,255,255,.7)" }}
              >
                Affinez votre recherche et consultez les logements disponibles à
                travers le Cameroun.
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox px={{ xs: 2, md: 4 }} pb={10}>
            <MDBox maxWidth="1180px" mx="auto">
              <Card
                sx={{
                  mt: -5,
                  position: "relative",
                  zIndex: 2,
                  borderRadius: 3,
                  boxShadow: "0 22px 55px rgba(16,24,43,.14)",
                }}
              >
                <MDBox
                  component="form"
                  onSubmit={handleSearch}
                  p={{ xs: 2.5, md: 3 }}
                >
                  <MDBox
                    display="grid"
                    sx={{
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(4, minmax(0, 1fr)) auto",
                      },
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Ville"
                      name="ville"
                      value={filtres.ville}
                      onChange={handleFiltreChange}
                    >
                      <MenuItem value="">Toutes les villes</MenuItem>
                      {VILLES.map((ville) => (
                        <MenuItem key={ville} value={ville}>
                          {ville}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Type de logement"
                      name="typeLogement"
                      value={filtres.typeLogement}
                      onChange={handleFiltreChange}
                    >
                      <MenuItem value="">Tous les types</MenuItem>
                      {TYPES_LOGEMENT.map((type) => (
                        <MenuItem key={type} value={type}>
                          {TYPE_LABELS[type]}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Transaction"
                      name="typeTransaction"
                      value={filtres.typeTransaction}
                      onChange={handleFiltreChange}
                    >
                      <MenuItem value="">Location ou vente</MenuItem>
                      {TYPES_TRANSACTION.map((type) => (
                        <MenuItem key={type} value={type}>
                          {TRANSACTION_LABELS[type]}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      size="small"
                      label="Budget maximum"
                      name="prixMax"
                      value={filtres.prixMax}
                      onChange={handleFiltreChange}
                      type="number"
                      inputProps={{ min: 0 }}
                    />
                    <MDButton
                      variant="gradient"
                      color="warning"
                      type="submit"
                      sx={{ minHeight: 40, px: 3 }}
                    >
                      <Icon sx={{ mr: 0.5, fontSize: 18 }}>search</Icon>
                      Rechercher
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>

              <MDBox
                mt={5}
                mb={3}
                display="flex"
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <MDBox>
                  <MDTypography variant="h4" fontWeight="bold">
                    {loading
                      ? "Recherche en cours…"
                      : `${logements.length} logement${
                          logements.length > 1 ? "s" : ""
                        }`}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mt={0.5}>
                    {Object.values(appliedFilters).some(Boolean)
                      ? "Résultats correspondant à vos critères"
                      : "Toutes les annonces actuellement disponibles"}
                  </MDTypography>
                </MDBox>
                {Object.values(appliedFilters).some(Boolean) && (
                  <MDButton
                    variant="text"
                    color="dark"
                    size="small"
                    onClick={resetFilters}
                  >
                    <Icon sx={{ mr: 0.5, fontSize: 18 }}>restart_alt</Icon>
                    Effacer les filtres
                  </MDButton>
                )}
              </MDBox>

              {erreur && (
                <Card
                  sx={{
                    mb: 3,
                    borderLeft: "4px solid #e53935",
                    boxShadow: "none",
                  }}
                >
                  <MDBox p={2} display="flex" alignItems="center" gap={1.5}>
                    <Icon color="error">cloud_off</Icon>
                    <MDTypography variant="body2" color="text">
                      {erreur}
                    </MDTypography>
                  </MDBox>
                </Card>
              )}

              {loading ? (
                <Card>
                  <MDBox
                    minHeight="20rem"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <MDBox textAlign="center">
                      <CircularProgress sx={{ color: "#f2a900" }} />
                      <MDTypography variant="body2" color="text" mt={2}>
                        Chargement des annonces…
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              ) : logements.length === 0 ? (
                <Card>
                  <MDBox py={7} px={3} textAlign="center">
                    <Icon sx={{ fontSize: 58, color: "#a7afbf" }}>
                      search_off
                    </Icon>
                    <MDTypography variant="h5" mt={2}>
                      Aucun logement trouvé
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mt={1} mb={2.5}>
                      Modifiez vos critères ou consultez l’ensemble des
                      annonces.
                    </MDTypography>
                    <MDButton
                      variant="gradient"
                      color="warning"
                      onClick={resetFilters}
                    >
                      Voir toutes les annonces
                    </MDButton>
                  </MDBox>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {logements.map((logement) => (
                    <Grid item xs={12} sm={6} lg={4} key={logement.id}>
                      <Card
                        role="link"
                        tabIndex={0}
                        onClick={() => openLogement(logement.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ")
                            openLogement(logement.id);
                        }}
                        sx={{
                          height: "100%",
                          overflow: "hidden",
                          cursor: "pointer",
                          border: "1px solid #e7eaf0",
                          borderRadius: 2.5,
                          boxShadow: "0 12px 30px rgba(16,24,43,.07)",
                          transition: "transform .2s ease, box-shadow .2s ease",
                          "&:hover": {
                            transform: "translateY(-5px)",
                            boxShadow: "0 20px 44px rgba(16,24,43,.13)",
                          },
                        }}
                      >
                        <MDBox
                          height="220px"
                          position="relative"
                          overflow="hidden"
                          bgColor="grey-200"
                        >
                          {logement.medias?.length > 0 ? (
                            <img
                              src={getFileUrl(logement.medias[0].fileUrl)}
                              alt={logement.titre}
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "block",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <MDBox
                              height="100%"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              sx={{
                                color: "#f2a900",
                                background:
                                  "linear-gradient(145deg, #1b2944, #10182b)",
                              }}
                            >
                              <Icon sx={{ fontSize: 58 }}>holiday_village</Icon>
                            </MDBox>
                          )}
                          <Chip
                            label={
                              TYPE_LABELS[logement.typeLogement] ||
                              logement.typeLogement
                            }
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 14,
                              left: 14,
                              color: "#10182b",
                              background: "#f2a900",
                              fontWeight: 700,
                            }}
                          />
                          <Chip
                            label={logement.statutLogement || "DISPONIBLE"}
                            color={
                              STATUT_COLORS[logement.statutLogement] ||
                              "success"
                            }
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 14,
                              right: 14,
                              fontWeight: 700,
                            }}
                          />
                        </MDBox>
                        <MDBox
                          p={2.5}
                          display="flex"
                          flexDirection="column"
                          flex={1}
                        >
                          <MDBox
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                            mb={0.75}
                          >
                            <Icon sx={{ color: "#d89000", fontSize: 17 }}>
                              location_on
                            </Icon>
                            <MDTypography variant="caption" color="text">
                              {logement.ville}
                              {logement.quartier
                                ? ` · ${logement.quartier}`
                                : ""}
                            </MDTypography>
                          </MDBox>
                          <MDTypography
                            variant="h6"
                            fontWeight="bold"
                            lineHeight={1.35}
                          >
                            {logement.titre}
                          </MDTypography>
                          <MDBox
                            mt={1.5}
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            {logement.nbPieces && (
                              <MDTypography variant="caption" color="text">
                                <Icon
                                  sx={{
                                    mr: 0.4,
                                    fontSize: 15,
                                    verticalAlign: "middle",
                                  }}
                                >
                                  meeting_room
                                </Icon>
                                {logement.nbPieces} pièces
                              </MDTypography>
                            )}
                            {logement.superficie && (
                              <MDTypography variant="caption" color="text">
                                <Icon
                                  sx={{
                                    mr: 0.4,
                                    fontSize: 15,
                                    verticalAlign: "middle",
                                  }}
                                >
                                  square_foot
                                </Icon>
                                {logement.superficie} m²
                              </MDTypography>
                            )}
                          </MDBox>
                          <MDBox
                            mt="auto"
                            pt={2}
                            display="flex"
                            alignItems="flex-end"
                            justifyContent="space-between"
                            gap={1}
                            sx={{ borderTop: "1px solid #edf0f4" }}
                          >
                            <MDBox>
                              <MDTypography
                                variant="h6"
                                fontWeight="bold"
                                color="dark"
                              >
                                {Number(logement.prix || 0).toLocaleString(
                                  "fr-FR"
                                )}{" "}
                                FCFA
                              </MDTypography>
                              {logement.typeTransaction === "LOCATION" && (
                                <MDTypography variant="caption" color="text">
                                  par mois
                                </MDTypography>
                              )}
                            </MDBox>
                            <MDBox
                              width="2.5rem"
                              height="2.5rem"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              borderRadius="lg"
                              sx={{ color: "#10182b", background: "#f2a900" }}
                            >
                              <Icon sx={{ fontSize: 19 }}>arrow_outward</Icon>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </MDBox>
          </MDBox>
        </main>

        <PublicFooter />
      </div>
    </PageLayout>
  );
}

export default SiteAnnonces;
