import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import RecentReservationsTable from "components/RecentReservationsTable";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { getLogementsPublic, getMesLogements } from "api/logementApi";
import {
  getMesReservations,
  getReservationsProprietaire,
  getToutesReservations,
} from "api/reservationApi";
import { API_BASE_URL, authHeaders, getUserRole } from "services/authService";

const ROLE_CONTENT = {
  ADMIN: {
    eyebrow: "Pilotage de la plateforme",
    title: "Bonjour, administrateur",
    description:
      "Validez les annonces et gardez une vue claire sur l’activité de SearchHome.",
    icon: "admin_panel_settings",
  },
  PROPRIETAIRE: {
    eyebrow: "Espace propriétaire",
    title: "Gérez vos biens sereinement",
    description:
      "Suivez vos logements et les réservations reçues depuis un seul espace.",
    icon: "home_work",
  },
  CLIENT: {
    eyebrow: "Espace client",
    title: "Bienvenue sur SearchHome",
    description:
      "Retrouvez vos réservations et poursuivez votre recherche de logement.",
    icon: "travel_explore",
  },
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

async function getPendingLogements() {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/logements/en-attente-validation`,
    {
      headers: authHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Impossible de charger les annonces à valider");
  }
  return response.json();
}

function Dashboard() {
  const navigate = useNavigate();
  const role = getUserRole();
  const content = ROLE_CONTENT[role] || ROLE_CONTENT.CLIENT;
  const [dashboardData, setDashboardData] = useState({
    logements: [],
    mesLogements: [],
    reservations: [],
    pendingLogements: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const requests = [{ key: "logements", promise: getLogementsPublic() }];

      if (role === "ADMIN") {
        requests.push({
          key: "pendingLogements",
          promise: getPendingLogements(),
        });
        requests.push({
          key: "reservations",
          promise: getToutesReservations(),
        });
      }
      if (role === "PROPRIETAIRE") {
        requests.push({ key: "mesLogements", promise: getMesLogements() });
        requests.push({
          key: "reservations",
          promise: getReservationsProprietaire(),
        });
      }
      if (role === "CLIENT") {
        requests.push({ key: "reservations", promise: getMesReservations() });
      }

      const results = await Promise.allSettled(
        requests.map(({ promise }) => promise)
      );
      if (!active) return;

      const nextData = {
        logements: [],
        mesLogements: [],
        reservations: [],
        pendingLogements: [],
      };
      let failedRequests = 0;

      results.forEach((result, index) => {
        const key = requests[index].key;
        if (result.status === "fulfilled") {
          nextData[key] = ensureArray(result.value);
        } else {
          failedRequests += 1;
        }
      });

      setDashboardData(nextData);
      if (failedRequests > 0) {
        setLoadWarning(
          failedRequests === requests.length
            ? "Les données du tableau de bord sont momentanément indisponibles."
            : "Certaines données n’ont pas pu être actualisées."
        );
      }
      setLoading(false);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [role]);

  const publishedCount = dashboardData.logements.length;
  const availableCount = dashboardData.logements.filter(
    (logement) =>
      !logement.statutLogement || logement.statutLogement === "DISPONIBLE"
  ).length;
  const myAvailableCount = dashboardData.mesLogements.filter(
    (logement) =>
      !logement.statutLogement || logement.statutLogement === "DISPONIBLE"
  ).length;
  const confirmedReservations = dashboardData.reservations.filter(
    (reservation) => reservation.statut === "CONFIRMEE"
  ).length;
  const pendingReservations = dashboardData.reservations.filter(
    (reservation) => reservation.statut === "EN_ATTENTE"
  ).length;

  const statCards =
    role === "ADMIN"
      ? [
          {
            title: "Logements publiés",
            count: publishedCount,
            icon: "apartment",
            color: "dark",
            label: "Annonces visibles",
          },
          {
            title: "À valider",
            count: dashboardData.pendingLogements.length,
            icon: "pending_actions",
            color: "warning",
            label: "Action requise",
          },
          {
            title: "Disponibles",
            count: availableCount,
            icon: "meeting_room",
            color: "success",
            label: "Sur la plateforme",
          },
          {
            title: "Réservations",
            count: dashboardData.reservations.length,
            icon: "calendar_month",
            color: "info",
            label: "Activité globale",
          },
        ]
      : role === "PROPRIETAIRE"
      ? [
          {
            title: "Mes logements",
            count: dashboardData.mesLogements.length,
            icon: "home_work",
            color: "dark",
            label: "Biens enregistrés",
          },
          {
            title: "Disponibles",
            count: myAvailableCount,
            icon: "key",
            color: "success",
            label: "Prêts à réserver",
          },
          {
            title: "Réservations",
            count: dashboardData.reservations.length,
            icon: "event_note",
            color: "info",
            label: "Demandes reçues",
          },
          {
            title: "Confirmées",
            count: confirmedReservations,
            icon: "task_alt",
            color: "primary",
            label: "Réservations validées",
          },
        ]
      : [
          {
            title: "Logements publiés",
            count: publishedCount,
            icon: "apartment",
            color: "dark",
            label: "Annonces à découvrir",
          },
          {
            title: "Mes réservations",
            count: dashboardData.reservations.length,
            icon: "book_online",
            color: "info",
            label: "Réservations au total",
          },
          {
            title: "Confirmées",
            count: confirmedReservations,
            icon: "task_alt",
            color: "success",
            label: "Réservations validées",
          },
          {
            title: "En attente",
            count: pendingReservations,
            icon: "schedule",
            color: "warning",
            label: "Demandes en cours",
          },
        ];

  const quickActions =
    role === "ADMIN"
      ? [
          {
            title: "Valider les annonces",
            description: "Examinez les logements soumis par les propriétaires.",
            icon: "verified",
            path: "/admin/validation",
            color: "#fff4d8",
          },
          {
            title: "Gérer les utilisateurs",
            description: "Consultez les comptes enregistrés sur la plateforme.",
            icon: "manage_accounts",
            path: "/tables",
            color: "#e8f1ff",
          },
        ]
      : role === "PROPRIETAIRE"
      ? [
          {
            title: "Ajouter un logement",
            description: "Publiez un nouveau bien et ajoutez ses photos.",
            icon: "add_home",
            path: "/ajouter-logement",
            color: "#fff4d8",
          },
          {
            title: "Voir mes logements",
            description: "Mettez à jour vos biens et suivez leur statut.",
            icon: "real_estate_agent",
            path: "/mes-logements",
            color: "#e8f1ff",
          },
        ]
      : [
          {
            title: "Explorer les annonces",
            description:
              "Trouvez un logement selon votre ville et votre budget.",
            icon: "travel_explore",
            path: "/annonces",
            color: "#fff4d8",
          },
          {
            title: "Mes réservations",
            description: "Consultez vos dates, statuts et paiements.",
            icon: "calendar_month",
            path: "/mes-reservations",
            color: "#e8f1ff",
          },
        ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card
          sx={{
            mb: 3,
            overflow: "hidden",
            color: "#fff",
            background:
              "linear-gradient(120deg, #10182b 0%, #1b2944 65%, #263b62 100%)",
            boxShadow: "0 18px 45px rgba(16, 24, 43, 0.18)",
          }}
        >
          <MDBox
            p={{ xs: 3, md: 4 }}
            display="flex"
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            flexDirection={{ xs: "column", md: "row" }}
            gap={3}
            position="relative"
          >
            <MDBox position="relative" zIndex={1}>
              <MDTypography
                variant="overline"
                sx={{
                  color: "#f2a900",
                  letterSpacing: "0.12em",
                  fontWeight: 800,
                }}
              >
                {content.eyebrow}
              </MDTypography>
              <MDTypography
                variant="h3"
                fontWeight="bold"
                color="white"
                mt={0.5}
              >
                {content.title}
              </MDTypography>
              <MDTypography
                variant="body2"
                mt={1}
                sx={{ color: "rgba(255,255,255,.68)", maxWidth: 560 }}
              >
                {content.description}
              </MDTypography>
            </MDBox>
            <MDBox
              width="5rem"
              height="5rem"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ color: "#10182b", background: "#f2a900", flexShrink: 0 }}
            >
              <Icon sx={{ fontSize: 40 }}>{content.icon}</Icon>
            </MDBox>
          </MDBox>
        </Card>

        {loadWarning && (
          <Card
            sx={{ mb: 3, borderLeft: "4px solid #f2a900", boxShadow: "none" }}
          >
            <MDBox p={2} display="flex" alignItems="center" gap={1.5}>
              <Icon sx={{ color: "#d89000" }}>info</Icon>
              <MDTypography variant="body2" color="text">
                {loadWarning}
              </MDTypography>
            </MDBox>
          </Card>
        )}

        {loading ? (
          <Card>
            <MDBox
              minHeight="18rem"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <MDBox textAlign="center">
                <CircularProgress sx={{ color: "#f2a900" }} />
                <MDTypography variant="body2" color="text" mt={2}>
                  Actualisation de votre tableau de bord…
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        ) : (
          <>
            <Grid container spacing={3}>
              {statCards.map((stat) => (
                <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                  <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                      color={stat.color}
                      icon={stat.icon}
                      title={stat.title}
                      count={stat.count}
                      percentage={{
                        color: "text",
                        amount: "",
                        label: stat.label,
                      }}
                    />
                  </MDBox>
                </Grid>
              ))}
            </Grid>

            <MDBox mt={3}>
              <RecentReservationsTable
                reservations={dashboardData.reservations}
                onViewAll={() =>
                  navigate(
                    role === "ADMIN"
                      ? "/reservations"
                      : role === "PROPRIETAIRE"
                      ? "/proprietaire/reservations"
                      : "/mes-reservations"
                  )
                }
                emptyMessage={
                  role === "ADMIN"
                    ? "Les réservations de la plateforme apparaîtront ici."
                    : role === "PROPRIETAIRE"
                    ? "Les demandes liées à vos logements apparaîtront ici."
                    : "Explorez les annonces pour effectuer votre première réservation."
                }
              />
            </MDBox>

            <MDBox mt={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#243a63" }}
                  >
                    Accès rapides
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mt={0.5} mb={2.5}>
                    Les actions les plus utiles pour votre profil.
                  </MDTypography>
                  <Grid container spacing={2}>
                    {quickActions.map((action) => (
                      <Grid item xs={12} md={6} key={action.title}>
                        <MDBox
                          component="button"
                          type="button"
                          onClick={() => navigate(action.path)}
                          width="100%"
                          height="100%"
                          p={2}
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                          textAlign="left"
                          sx={{
                            border: "1px solid #e7eaf0",
                            borderRadius: 2,
                            background: "#fff",
                            cursor: "pointer",
                            transition:
                              "transform .18s ease, box-shadow .18s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 10px 24px rgba(16,24,43,.08)",
                            },
                          }}
                        >
                          <MDBox
                            width="2.8rem"
                            height="2.8rem"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="lg"
                            flexShrink={0}
                            sx={{
                              color: "#1b2944",
                              background: action.color,
                            }}
                          >
                            <Icon>{action.icon}</Icon>
                          </MDBox>
                          <MDBox flex={1}>
                            <MDTypography
                              variant="button"
                              fontWeight="bold"
                              display="block"
                            >
                              {action.title}
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              color="text"
                              lineHeight={1.45}
                            >
                              {action.description}
                            </MDTypography>
                          </MDBox>
                          <Icon sx={{ color: "#a7afbf", fontSize: 19 }}>
                            chevron_right
                          </Icon>
                        </MDBox>
                      </Grid>
                    ))}
                  </Grid>
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
