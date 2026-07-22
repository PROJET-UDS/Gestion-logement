import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { getMonAbonnement, souscrireAbonnement, compterVedettes } from "api/abonnementApi";
import { getUserId } from "services/authService";

const PLANS = [
  {
    type: "GRATUIT",
    label: "Gratuit",
    price: "0",
    pubs: "4 publications",
    description: "Pour debuter sur la plateforme",
    color: "light",
    features: ["4 annonces maximales", "Pas de mise en vedette"],
  },
  {
    type: "MENSUEL_10_PUBS",
    label: "Premium Mensuel",
    price: "3 000",
    pubs: "10 publications / mois",
    description: "Pour les proprietaires actifs",
    color: "info",
    features: ["10 annonces par mois", "Mise en vedette possible"],
    monthly: true,
  },
  {
    type: "MENSUEL_ILLIMITE",
    label: "Illimite Mensuel",
    price: "5 000",
    pubs: "Publications illimitees",
    description: "Pour les gros proprietaires",
    color: "success",
    features: ["Annonces illimitees", "Mise en vedette possible"],
    monthly: true,
  },
  {
    type: "ANNUEL_10_PUBS",
    label: "Premium Annuel",
    price: "32 400",
    pubs: "10 publications / mois",
    description: "10% d'economie vs mensuel",
    color: "warning",
    features: ["10 annonces par mois", "Mise en vedette possible", "10% de reduction"],
    annual: true,
  },
  {
    type: "ANNUEL_ILLIMITE",
    label: "Illimite Annuel",
    price: "54 000",
    pubs: "Publications illimitees",
    description: "10% d'economie vs mensuel",
    color: "error",
    features: ["Annonces illimitees", "Mise en vedette possible", "10% de reduction"],
    annual: true,
  },
];

const VEDETTE_PLANS = [
  {
    type: "MENSUEL",
    label: "Vedette Mensuelle",
    price: "1 000",
    description: "Mettre en vedette pour 1 mois",
    features: ["Apparaît en premier", "Max 4 logements"],
    icon: "star",
  },
  {
    type: "ANNUEL",
    label: "Vedette Annuelle",
    price: "9 000",
    description: "Mettre en vedette pour 1 an",
    features: ["Apparaît en premier", "Max 4 logements/mois", "Economie de 25%"],
    icon: "stars",
  },
];

function Abonnement() {
  const [abonnement, setAbonnement] = useState(null);
  const [nbVedettes, setNbVedettes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [ab, vedettes] = await Promise.all([
        getMonAbonnement(),
        compterVedettes(),
      ]);
      setAbonnement(ab);
      setNbVedettes(vedettes.count || 0);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSouscrire = async (type) => {
    setSubscribing(true);
    setMessage("");
    try {
      await souscrireAbonnement({ typeAbonnement: type, montantPaye: 0, paymentRef: "SIMULATED" });
      setMessage("Abonnement active avec succes !");
      await loadData();
    } catch (err) {
      setMessage(err.message || "Erreur lors de la souscription");
    } finally {
      setSubscribing(false);
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "GRATUIT": return "light";
      case "MENSUEL_10_PUBS":
      case "ANNUEL_10_PUBS": return "info";
      case "MENSUEL_ILLIMITE":
      case "ANNUEL_ILLIMITE": return "success";
      default: return "light";
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
        {message && (
          <MDBox mb={3}>
            <MDTypography
              variant="caption"
              color={message.includes("succes") ? "success" : "error"}
              fontWeight="medium"
            >
              {message}
            </MDTypography>
          </MDBox>
        )}

        <Card sx={{ p: 3, mb: 3 }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h5" fontWeight="bold">
              Mon Abonnement
            </MDTypography>
            <MDBox display="flex" gap={1}>
              <MDButton
                variant="gradient"
                color="warning"
                size="small"
                onClick={() => navigate("/abonnement/vedette")}
              >
                <Icon fontSize="small">star</Icon>&nbsp; Passer en Vedette
              </MDButton>
            </MDBox>
          </MDBox>

          {abonnement && (
            <Card sx={{ p: 2, bgcolor: "grey.100" }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography variant="h6" fontWeight="bold" color={getBadgeColor(abonnement.typeAbonnement)}>
                    {abonnement.typeAbonnement === "GRATUIT" ? "Plan Gratuit" :
                     abonnement.typeAbonnement?.replace(/_/g, " ")}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mt={0.5}>
                    {abonnement.publicationsIncluses === -1
                      ? "Publications illimitees"
                      : `${abonnement.publicationsUtilisees || 0} / ${abonnement.publicationsIncluses} publications utilisees`}
                  </MDTypography>
                  {abonnement.dateFin && (
                    <MDTypography variant="caption" color="text">
                      Expire le {new Date(abonnement.dateFin).toLocaleDateString("fr-FR")}
                    </MDTypography>
                  )}
                </MDBox>
                <MDBox textAlign="right">
                  <MDTypography variant="h6" fontWeight="bold">
                    {nbVedettes}/4
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Logements en vedette ce mois
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          )}
        </Card>

        <MDTypography variant="h5" fontWeight="bold" mb={2}>
          Plans d'abonnement
        </MDTypography>
        <Grid container spacing={2} mb={4}>
          {PLANS.filter(p => p.type !== "GRATUIT").map((plan) => (
            <Grid item xs={12} md={6} key={plan.type}>
              <Card sx={{
                p: 3,
                height: "100%",
                border: abonnement?.typeAbonnement === plan.type ? "2px solid" : "1px solid",
                borderColor: abonnement?.typeAbonnement === plan.type ? "info.main" : "grey.300",
              }}>
                <MDBox display="flex" justifyContent="space-between" alignItems="start">
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="bold" color={plan.color}>
                      {plan.label}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mt={0.5}>
                      {plan.description}
                    </MDTypography>
                  </MDBox>
                  <MDBox textAlign="right">
                    <MDTypography variant="h4" fontWeight="bold" color={plan.color}>
                      {plan.price}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      FCFA {plan.monthly ? "/mois" : plan.annual ? "/an" : ""}
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox mt={2}>
                  {plan.features.map((f, i) => (
                    <MDBox key={i} display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Icon fontSize="small" color="success">check_circle</Icon>
                      <MDTypography variant="body2" color="text">{f}</MDTypography>
                    </MDBox>
                  ))}
                </MDBox>

                <MDBox mt={2}>
                  <MDButton
                    variant={abonnement?.typeAbonnement === plan.type ? "outlined" : "gradient"}
                    color={plan.color}
                    fullWidth
                    disabled={subscribing || abonnement?.typeAbonnement === plan.type}
                    onClick={() => handleSouscrire(plan.type)}
                  >
                    {abonnement?.typeAbonnement === plan.type ? "Plan actuel" : "Souscrire"}
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>

        <MDTypography variant="h5" fontWeight="bold" mb={2}>
          Passer en Vedette
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Mettez vos meilleurs logements en avant pour qu'ils apparaissent toujours en premier.
          Maximum 4 logements en vedette par mois.
        </MDTypography>
        <Grid container spacing={2}>
          {VEDETTE_PLANS.map((plan) => (
            <Grid item xs={12} md={6} key={plan.type}>
              <Card sx={{ p: 3, height: "100%" }}>
                <MDBox display="flex" gap={2} alignItems="center" mb={2}>
                  <Icon fontSize="large" color="warning">{plan.icon}</Icon>
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="bold">
                      {plan.label}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {plan.description}
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox mb={2}>
                  {plan.features.map((f, i) => (
                    <MDBox key={i} display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Icon fontSize="small" color="success">check_circle</Icon>
                      <MDTypography variant="body2" color="text">{f}</MDTypography>
                    </MDBox>
                  ))}
                </MDBox>

                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h5" fontWeight="bold" color="warning">
                    {plan.price} FCFA
                  </MDTypography>
                  <MDButton
                    variant="gradient"
                    color="warning"
                    onClick={() => navigate("/abonnement/vedette")}
                  >
                    Choisir
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Abonnement;
