import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

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
import MDAlert from "components/MDAlert";
import { PublicFooter, PublicHeader } from "components/PublicSiteChrome";

import PageLayout from "examples/LayoutContainers/PageLayout";

import { getLogementById, getFileUrl } from "api/logementApi";
import { creerReservation, payerReservation } from "api/reservationApi";
import { isAuthenticated, getUserRole } from "services/authService";

const STATUT_COLORS = {
  DISPONIBLE: "success",
  LOUE: "warning",
  EN_MAINTENANCE: "info",
  INDISPONIBLE: "error",
};

function SiteLogementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reserverAuto = searchParams.get("reserver") === "1";
  const formRef = useRef(null);
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [methodepayment, setMethodepayment] = useState("VISA");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationMsg, setReservationMsg] = useState(null);
  const [reservationStatut, setReservationStatut] = useState(null);

  useEffect(() => {
    getLogementById(id)
      .then(setLogement)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (reserverAuto && !loading && logement) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);
    }
  }, [reserverAuto, loading, logement]);

  const handleReservation = async (e) => {
    e.preventDefault();
    setReservationMsg(null);

    if (!isAuthenticated()) {
      navigate(
        `/authentification/sign-in?redirect=${encodeURIComponent(
          `/annonces/${logement.id}?reserver=1`
        )}`
      );
      return;
    }

    if (getUserRole() !== "CLIENT") {
      setReservationStatut("error");
      setReservationMsg(
        "Seul un compte client peut effectuer une réservation."
      );
      return;
    }

    if (!dateDebut || !dateFin) {
      setReservationStatut("error");
      setReservationMsg("Veuillez sélectionner les dates de début et de fin.");
      return;
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      setReservationStatut("error");
      setReservationMsg(
        "La date de fin doit être postérieure à la date de début."
      );
      return;
    }

    if (methodepayment !== "VISA" && !phoneNumber) {
      setReservationStatut("error");
      setReservationMsg("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    setReservationLoading(true);
    try {
      const reservation = await creerReservation({
        logementId: logement.id,
        dateDebut,
        dateFin,
        methodepayment,
        phoneNumber: methodepayment !== "VISA" ? phoneNumber : undefined,
      });
      let paymentCompleted = true;
      try {
        await payerReservation(reservation.id, methodepayment);
      } catch (payErr) {
        paymentCompleted = false;
      }
      setReservationStatut("success");
      setReservationMsg(
        paymentCompleted
          ? "Réservation créée et paiement enregistré."
          : "Réservation créée. Le paiement reste à finaliser depuis votre espace."
      );
      setTimeout(() => navigate("/mes-reservations", { replace: true }), 1800);
    } catch (err) {
      setReservationStatut("error");
      setReservationMsg(err.message || "Erreur lors de la réservation.");
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
          <PublicHeader active="annonces" />
          <MDBox
            minHeight="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <MDBox textAlign="center">
              <CircularProgress sx={{ color: "#f2a900" }} />
              <MDTypography variant="body2" color="text" mt={2}>
                Chargement du logement…
              </MDTypography>
            </MDBox>
          </MDBox>
        </div>
      </PageLayout>
    );
  }

  if (erreur || !logement) {
    return (
      <PageLayout>
        <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
          <PublicHeader active="annonces" />
          <MDBox minHeight="82vh" pt={16} px={2}>
            <Card sx={{ maxWidth: 700, mx: "auto" }}>
              <MDBox p={3}>
                <MDAlert color="error">
                  {erreur || "Logement introuvable"}
                </MDAlert>
                <MDButton
                  variant="gradient"
                  color="warning"
                  onClick={() => navigate("/annonces")}
                  sx={{ mt: 2 }}
                >
                  Retour aux annonces
                </MDButton>
              </MDBox>
            </Card>
          </MDBox>
          <PublicFooter />
        </div>
      </PageLayout>
    );
  }

  const medias = logement.medias || [];
  const equipements = logement.equipements
    ? logement.equipements
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <PageLayout>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PublicHeader active="annonces" />

        <main style={{ paddingTop: 76, minHeight: "100vh" }}>
          <MDBox
            py={{ xs: 3, md: 5 }}
            px={{ xs: 2, md: 4 }}
            maxWidth="1180px"
            mx="auto"
          >
            <MDBox display="flex" alignItems="center" mb={3} gap={1}>
              <MDButton
                variant="text"
                color="dark"
                size="small"
                onClick={() => navigate("/annonces")}
                sx={{ px: 0 }}
              >
                <Icon sx={{ mr: 0.5, fontSize: 20 }}>arrow_back</Icon>
                Retour aux annonces
              </MDButton>
            </MDBox>

            <MDBox
              mb={3}
              display="flex"
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              flexDirection={{ xs: "column", md: "row" }}
              gap={2}
            >
              <MDBox>
                <MDTypography variant="h4" fontWeight="bold">
                  {logement.titre}
                </MDTypography>
                <MDBox display="flex" alignItems="center" gap={0.5} mt={1}>
                  <Icon sx={{ color: "#d89000", fontSize: 18 }}>
                    location_on
                  </Icon>
                  <MDTypography variant="body2" color="text">
                    {logement.ville}
                    {logement.quartier ? ` · ${logement.quartier}` : ""}
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox display="flex" flexWrap="wrap" gap={1}>
                <Chip
                  label={logement.statutLogement || "DISPONIBLE"}
                  color={STATUT_COLORS[logement.statutLogement] || "default"}
                  size="small"
                />
                <Chip
                  label={logement.typeLogement}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={logement.typeTransaction}
                  size="small"
                  variant="outlined"
                />
              </MDBox>
            </MDBox>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card sx={{ overflow: "hidden", borderRadius: 2.5 }}>
                  <MDBox p={2}>
                    {medias.length > 0 ? (
                      <MDBox>
                        <MDBox mb={1}>
                          <img
                            src={getFileUrl(medias[activePhotoIndex]?.fileUrl)}
                            alt={logement.titre}
                            style={{
                              width: "100%",
                              height: 430,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        </MDBox>
                        {medias.length > 1 && (
                          <MDBox
                            display="flex"
                            gap={0.5}
                            overflow="auto"
                            pb={1}
                          >
                            {medias.map((media, i) => (
                              <MDBox
                                key={media.id || i}
                                onClick={() => setActivePhotoIndex(i)}
                                sx={{
                                  cursor: "pointer",
                                  border:
                                    i === activePhotoIndex
                                      ? "2px solid #f0a500"
                                      : "2px solid transparent",
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={getFileUrl(media.fileUrl)}
                                  alt=""
                                  style={{
                                    width: 72,
                                    height: 54,
                                    objectFit: "cover",
                                  }}
                                />
                              </MDBox>
                            ))}
                          </MDBox>
                        )}
                      </MDBox>
                    ) : (
                      <MDBox
                        py={10}
                        textAlign="center"
                        bgColor="grey-200"
                        borderRadius="md"
                      >
                        <Icon sx={{ fontSize: 80, color: "text.disabled" }}>
                          home
                        </Icon>
                        <MDTypography variant="body2" color="text" mt={1}>
                          Aucune photo
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>

                <Card sx={{ mt: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>
                      Description
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      color="text"
                      whiteSpace="pre-wrap"
                      lineHeight={1.8}
                    >
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
                          <Chip
                            key={eq}
                            label={eq}
                            color="info"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </MDBox>
                    </MDBox>
                  </Card>
                )}

                <Card sx={{ mt: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Localisation
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                      <Icon sx={{ fontSize: 20, color: "info.main" }}>
                        location_on
                      </Icon>
                      <MDTypography variant="body2">
                        {logement.adresse}
                      </MDTypography>
                    </MDBox>
                    <MDTypography variant="body2" color="text">
                      {logement.ville}
                      {logement.quartier ? `, ${logement.quartier}` : ""}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card
                  sx={{
                    position: { md: "sticky" },
                    top: 100,
                    borderRadius: 2.5,
                  }}
                >
                  <MDBox p={3}>
                    <MDTypography
                      variant="h3"
                      fontWeight="bold"
                      color="dark"
                      mb={0.5}
                    >
                      {Number(logement.prix).toLocaleString("fr-FR")} FCFA
                    </MDTypography>
                    {logement.typeTransaction === "LOCATION" && (
                      <MDTypography variant="body2" color="text" mb={2}>
                        /mois
                      </MDTypography>
                    )}

                    <MDBox display="flex" flexWrap="wrap" gap={1} mb={3}>
                      {logement.nbPieces && (
                        <Chip
                          icon={<Icon sx={{ fontSize: 16 }}>meeting_room</Icon>}
                          label={`${logement.nbPieces} pièces`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {logement.superficie && (
                        <Chip
                          icon={<Icon sx={{ fontSize: 16 }}>square_foot</Icon>}
                          label={`${logement.superficie} m²`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {logement.charges > 0 && (
                        <Chip
                          label={`${Number(logement.charges).toLocaleString(
                            "fr-FR"
                          )} FCFA charges`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </MDBox>

                    {logement.typeTransaction === "LOCATION" && (
                      <MDBox
                        component="form"
                        onSubmit={handleReservation}
                        ref={formRef}
                      >
                        <MDTypography variant="h6" fontWeight="medium" mb={2}>
                          Réserver ce logement
                        </MDTypography>

                        {reservationMsg && (
                          <MDBox mb={2}>
                            <MDAlert
                              color={
                                reservationStatut === "success"
                                  ? "success"
                                  : "error"
                              }
                              dismissible
                              onClose={() => setReservationMsg(null)}
                            >
                              {reservationMsg}
                            </MDAlert>
                          </MDBox>
                        )}

                        <TextField
                          fullWidth
                          size="small"
                          label="Date de début"
                          type="date"
                          value={dateDebut}
                          onChange={(e) => setDateDebut(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            min: new Date().toISOString().split("T")[0],
                          }}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Date de fin"
                          type="date"
                          value={dateFin}
                          onChange={(e) => setDateFin(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            min:
                              dateDebut ||
                              new Date().toISOString().split("T")[0],
                          }}
                          sx={{ mb: 3 }}
                        />

                        {dateDebut &&
                          dateFin &&
                          new Date(dateFin) > new Date(dateDebut) && (
                            <MDBox
                              mb={2}
                              p={2}
                              bgColor="grey-100"
                              borderRadius="md"
                            >
                              <MDTypography
                                variant="body2"
                                color="text"
                                mb={0.5}
                              >
                                Durée du séjour
                              </MDTypography>
                              <MDTypography variant="h6" fontWeight="medium">
                                {Math.ceil(
                                  (new Date(dateFin) - new Date(dateDebut)) /
                                    (1000 * 60 * 60 * 24)
                                )}{" "}
                                jours
                              </MDTypography>
                              <MDTypography variant="body2" color="text" mt={1}>
                                Coût estimé
                              </MDTypography>
                              <MDTypography
                                variant="h6"
                                fontWeight="bold"
                                color="dark"
                              >
                                {Math.ceil(
                                  (((new Date(dateFin) - new Date(dateDebut)) /
                                    (1000 * 60 * 60 * 24)) *
                                    Number(logement.prix)) /
                                    30
                                ).toLocaleString("fr-FR")}{" "}
                                FCFA
                              </MDTypography>
                            </MDBox>
                          )}

                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Moyen de paiement"
                          value={methodepayment}
                          onChange={(e) => setMethodepayment(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="VISA">Carte bancaire</MenuItem>
                          <MenuItem value="ORANGE_MONEY">Orange Money</MenuItem>
                          <MenuItem value="MTN_MOMO">MTN MoMo</MenuItem>
                          <MenuItem value="WAVE">Wave</MenuItem>
                        </TextField>

                        {methodepayment !== "VISA" && (
                          <TextField
                            fullWidth
                            size="small"
                            label="Numéro de téléphone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="6XX XXX XXX"
                            sx={{ mb: 2 }}
                          />
                        )}

                        <MDButton
                          variant="gradient"
                          color="warning"
                          type="submit"
                          fullWidth
                          disabled={reservationLoading}
                        >
                          {reservationLoading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            "Réserver et payer"
                          )}
                        </MDButton>

                        {!isAuthenticated() && (
                          <MDTypography
                            variant="caption"
                            color="text"
                            textAlign="center"
                            display="block"
                            mt={2}
                          >
                            Connectez-vous pour réserver
                          </MDTypography>
                        )}
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        </main>

        <PublicFooter />
      </div>
    </PageLayout>
  );
}

export default SiteLogementDetail;
