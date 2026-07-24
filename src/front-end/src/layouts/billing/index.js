import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { getPaiementsParUser } from "api/paiementApi";
import { getUserId } from "services/authService";

function Billing() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const userId = getUserId();
      if (userId) {
        const data = await getPaiementsParUser(userId);
        setPayments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError("Impossible de charger l'historique des paiements");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  Historique des paiements
                </MDTypography>
                {error && (
                  <MDBox mb={2}>
                    <MDAlert color="error">{error}</MDAlert>
                  </MDBox>
                )}
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Reservation</TableCell>
                          <TableCell>Montant</TableCell>
                          <TableCell>Devise</TableCell>
                          <TableCell>Moyen</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              Aucun paiement trouve
                            </TableCell>
                          </TableRow>
                        ) : (
                          payments.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{p.id}</TableCell>
                              <TableCell>{p.reservationId || "-"}</TableCell>
                              <TableCell>{p.amount}</TableCell>
                              <TableCell>{p.currency || "EUR"}</TableCell>
                              <TableCell>{p.provider || "-"}</TableCell>
                              <TableCell>
                                <MDTypography
                                  variant="caption"
                                  color={statusColor(p.status || p.statut)}
                                  fontWeight="bold"
                                >
                                  {p.status || p.statut}
                                </MDTypography>
                              </TableCell>
                              <TableCell>{formatDate(p.dateCreation || p.createdAt)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
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

export default Billing;
