import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { getUserRole, authHeaders } from "services/authService";
import { getMesReservations } from "api/reservationApi";
import { getMonAbonnement } from "api/abonnementApi";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "http://localhost:8089";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    logements: 0,
    reservations: 0,
    enAttenteValidation: 0,
    mesLogements: 0,
  });
  const [reservations, setReservations] = useState([]);
  const [abonnement, setAbonnement] = useState(null);

  const role = getUserRole();

  useEffect(() => {
    loadStats();
    if (role === "CLIENT") loadReservations();
    if (role === "PROPRIETAIRE") loadAbonnement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAbonnement = async () => {
    try {
      const ab = await getMonAbonnement();
      setAbonnement(ab);
    } catch (err) {
      // ignore
    }
  };

  const loadStats = async () => {
    try {
      const headers = { ...authHeaders() };

      const logementsRes = await fetch(`${API_BASE_URL}/api/v1/logements/publies`);
      if (logementsRes.ok) {
        const data = await logementsRes.json();
        setStats((s) => ({ ...s, logements: data.length }));
      }

      if (role === "ADMIN") {
        const pendingRes = await fetch(`${API_BASE_URL}/api/v1/logements/en-attente-validation`, { headers });
        if (pendingRes.ok) {
          const data = await pendingRes.json();
          setStats((s) => ({ ...s, enAttenteValidation: data.length }));
        }
      }

      if (role === "PROPRIETAIRE") {
        const mesRes = await fetch(`${API_BASE_URL}/api/v1/logements/mes-logements`, { headers });
        if (mesRes.ok) {
          const data = await mesRes.json();
          setStats((s) => ({ ...s, mesLogements: data.length }));
        }
      }

      if (role === "CLIENT") {
        const resaRes = await fetch(`${API_BASE_URL}/api/reservations/mes-reservations`, { headers });
        if (resaRes.ok) {
          const data = await resaRes.json();
          setStats((s) => ({ ...s, reservations: data.length }));
        }
      }
    } catch (err) {
      // silently ignore dashboard stat errors
    }
  };

  const loadReservations = async () => {
    try {
      const data = await getMesReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      // ignore
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "-";

  const statutColor = (s) => {
    if (!s) return "default";
    const map = { EN_ATTENTE: "warning", CONFIRMEE: "success", ANNULEE: "error", TERMINEE: "info" };
    return map[s] || "default";
  };

  const paymentColor = (s) => {
    if (!s) return "default";
    const map = { EN_ATTENTE: "warning", PAYE: "success", REMBOURSE: "info" };
    return map[s] || "default";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h4" fontWeight="medium">
              Bienvenue sur votre tableau de bord
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {role === "ADMIN" && "Administration de la plateforme"}
              {role === "PROPRIETAIRE" && "Gestion de vos logements"}
              {role === "CLIENT" && "Suivi de vos reservations"}
            </MDTypography>
          </MDBox>
          <MDButton variant="outlined" color="info" size="small" onClick={() => navigate("/")}>
            <Icon sx={{ mr: 0.5, fontSize: 16 }}>home</Icon>
            Retour a l&apos;accueil
          </MDButton>
        </MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="apartment"
                title="Logements publies"
                count={stats.logements}
                percentage={{ color: "success", amount: "", label: "Annonces actives" }}
              />
            </MDBox>
          </Grid>

          {role === "ADMIN" && (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="pending_actions"
                  title="En attente"
                  count={stats.enAttenteValidation}
                  percentage={{ color: "warning", amount: "", label: "A valider" }}
                />
              </MDBox>
            </Grid>
          )}

          {role === "PROPRIETAIRE" && (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon="home_work"
                  title="Mes logements"
                  count={stats.mesLogements}
                  percentage={{ color: "success", amount: "", label: "Total" }}
                />
              </MDBox>
            </Grid>
          )}

          {role === "CLIENT" && (
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="book_online"
                  title="Mes reservations"
                  count={stats.reservations}
                  percentage={{ color: "success", amount: "", label: "Total" }}
                />
              </MDBox>
            </Grid>
          )}

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="security"
                title="Role"
                count={role}
                percentage={{ color: "info", amount: "", label: "Votre profil" }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {role === "PROPRIETAIRE" && abonnement && (
          <Card sx={{ p: 2, mt: 3, mb: 2, cursor: "pointer", "&:hover": { boxShadow: 4 } }} onClick={() => navigate("/abonnement")}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <MDBox display="flex" alignItems="center" gap={2}>
                <Icon fontSize="large" color="warning">card_membership</Icon>
                <MDBox>
                  <MDTypography variant="h6" fontWeight="bold">
                    Abonnement: {abonnement.typeAbonnement?.replace(/_/g, " ") || "Gratuit"}
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {abonnement.publicationsIncluses === -1
                      ? "Publications illimitees"
                      : `${abonnement.publicationsRestantes || 0} publications restantes sur ${abonnement.publicationsIncluses}`}
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDButton variant="gradient" color="warning" size="small">
                <Icon sx={{ mr: 0.5, fontSize: 16 }}>star</Icon>
                Passer en vedette
              </MDButton>
            </MDBox>
          </Card>
        )}

        {role === "CLIENT" && reservations.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <MDBox p={3}>
              <MDTypography variant="h5" fontWeight="medium" mb={3}>
                Mes reservations recentes
              </MDTypography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Logement</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Paiement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.slice(0, 5).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.logementTitre || `Logement #${r.logementId}`}</TableCell>
                        <TableCell>{formatDate(r.dateDebut)} - {formatDate(r.dateFin)}</TableCell>
                        <TableCell>{r.prixLogement ? `${Number(r.prixLogement).toLocaleString("fr-FR")} FCFA` : "-"}</TableCell>
                        <TableCell>
                          <Chip label={r.statut} color={statutColor(r.statut)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={r.paymentStatut} color={paymentColor(r.paymentStatut)} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <MDBox mt={2} textAlign="right">
                <MDButton variant="text" color="info" size="small" onClick={() => navigate("/mes-reservations")}>
                  Voir toutes mes reservations
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>
        )}

        {role === "PROPRIETAIRE" && (
          <Card sx={{ mt: 3 }}>
            <MDBox p={3}>
              <MDTypography variant="body2" color="text">
                <Icon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}>info</Icon>
                Consultez vos logements et les demandes de reservation dans la rubrique &quot;Mes Logements&quot;.
              </MDTypography>
            </MDBox>
          </Card>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
