import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Service API payment
import { getHistoriquepayments } from "api/paymentApi";

function Historiquepayments() {
  const [payments, setpayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        const response = await getHistoriquepayments();
        setpayments(response.data);
        setErreur(null);
      } catch (error) {
        setErreur(
          "Impossible de récupérer l'historique. Le backend n'est peut-être pas encore disponible."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistorique();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  Historique des payments
                </MDTypography>

                {erreur && (
                  <MDBox mb={2}>
                    <MDAlert color="error">{erreur}</MDAlert>
                  </MDBox>
                )}

                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  !erreur && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Montant</TableCell>
                            <TableCell>Devise</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {payments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                Aucun payment trouvé.
                              </TableCell>
                            </TableRow>
                          ) : (
                            payments.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell>{p.id}</TableCell>
                                <TableCell>{p.montant}</TableCell>
                                <TableCell>{p.devise}</TableCell>
                                <TableCell>{p.statut}</TableCell>
                                <TableCell>{p.dateCreation}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
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

export default Historiquepayments;