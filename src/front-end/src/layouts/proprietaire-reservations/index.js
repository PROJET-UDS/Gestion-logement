import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import { getReservationsProprietaire } from "api/reservationApi";

const STATUT_COLORS = {
  EN_ATTENTE: "warning",
  CONFIRMEE: "success",
  ANNULEE: "error",
  TERMINEE: "info",
};

const PAYMENT_COLORS = {
  EN_ATTENTE: "warning",
  PAYE: "success",
  REMBOURSE: "info",
};

function ProprietaireReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await getReservationsProprietaire();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "-");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" fontWeight="medium" mb={3}>
          Réservations de mes logements
        </MDTypography>
        {error && (
          <MDBox mb={2} p={2} bgColor="error" borderRadius="md">
            <MDTypography variant="body2" color="white">
              {error}
            </MDTypography>
          </MDBox>
        )}
        {loading ? (
          <MDBox display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </MDBox>
        ) : (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Logement</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Paiement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Aucune réservation pour vos logements
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          {r.logementTitre || `Logement #${r.logementId}`}
                        </TableCell>
                        <TableCell>{r.clientNom || r.clientId}</TableCell>
                        <TableCell>
                          {formatDate(r.dateDebut)} - {formatDate(r.dateFin)}
                        </TableCell>
                        <TableCell>
                          {r.prixLogement
                            ? `${Number(r.prixLogement).toLocaleString(
                                "fr-FR"
                              )} FCFA`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.statut}
                            color={STATUT_COLORS[r.statut] || "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.paymentStatut}
                            color={PAYMENT_COLORS[r.paymentStatut] || "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProprietaireReservations;
