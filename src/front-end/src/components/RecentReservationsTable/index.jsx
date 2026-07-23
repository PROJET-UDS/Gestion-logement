import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const STATUS_STYLES = {
  EN_ATTENTE: { label: "EN ATTENTE", background: "#fff0bd", color: "#7c5200" },
  CONFIRMEE: { label: "CONFIRMÉE", background: "#57bc68", color: "#083d16" },
  ANNULEE: { label: "ANNULÉE", background: "#ff4b40", color: "#ffffff" },
  TERMINEE: { label: "TERMINÉE", background: "#dce9ff", color: "#245aa8" },
};

const PAYMENT_STYLES = {
  EN_ATTENTE: { label: "EN ATTENTE", color: "#b57800", border: "#e2b24b" },
  PAYE: { label: "PAYÉ", color: "#55ae63", border: "#79cc85" },
  SUCCESS: { label: "PAYÉ", color: "#55ae63", border: "#79cc85" },
  PENDING: { label: "EN ATTENTE", color: "#b57800", border: "#e2b24b" },
  REMBOURSE: { label: "REMBOURSÉ", color: "#2879ff", border: "#70a6ff" },
  FAILED: { label: "ÉCHOUÉ", color: "#e34840", border: "#f08a85" },
};

const DEFAULT_STATUS = {
  label: "NON DÉFINI",
  background: "#edf0f5",
  color: "#667085",
};

const DEFAULT_PAYMENT = {
  label: "NON DÉFINI",
  color: "#667085",
  border: "#c7ced8",
};

const formatDate = (value) => {
  if (!value) return "—";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (reservation) => {
  const amount =
    reservation.prixLogement ??
    reservation.montantTotal ??
    reservation.montant;

  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `${Number(amount).toLocaleString("fr-FR")} FCFA`;
};

const getTimestamp = (reservation) => {
  if (reservation.dateCreation) {
    const timestamp = new Date(reservation.dateCreation).getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }
  return Number(reservation.id) || 0;
};

function RecentReservationsTable({
  reservations,
  onViewAll,
  emptyMessage,
  limit,
}) {
  const recentReservations = [...reservations]
    .sort((first, second) => getTimestamp(second) - getTimestamp(first))
    .slice(0, limit);

  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 8px 24px rgba(16, 24, 43, 0.1)",
        overflow: "hidden",
      }}
    >
      <MDBox p={{ xs: 2.25, md: 3 }}>
        <MDBox
          mb={3}
          display="flex"
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={1.5}
        >
          <MDBox>
            <MDTypography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#243a63" }}
            >
              Réservations récentes
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={0.5}>
              Les dernières informations utiles de votre activité.
            </MDTypography>
          </MDBox>

          {onViewAll && reservations.length > 0 && (
            <MDButton
              variant="text"
              size="small"
              onClick={onViewAll}
              sx={{
                color: "#1769ff",
                fontWeight: 800,
                "&:hover": { color: "#0f4fc5" },
              }}
            >
              Tout afficher
              <Icon sx={{ ml: 0.5, fontSize: "17px !important" }}>
                arrow_forward
              </Icon>
            </MDButton>
          )}
        </MDBox>

        {recentReservations.length === 0 ? (
          <MDBox
            py={5}
            px={2}
            display="flex"
            alignItems="center"
            flexDirection="column"
            textAlign="center"
            borderRadius="lg"
            sx={{ background: "#f8f9fb", border: "1px solid #edf0f4" }}
          >
            <Icon sx={{ fontSize: "44px !important", color: "#a7afbf" }}>
              event_busy
            </Icon>
            <MDTypography variant="h6" mt={1.5}>
              Aucune réservation pour le moment
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={0.5}>
              {emptyMessage}
            </MDTypography>
          </MDBox>
        ) : (
          <TableContainer
            sx={{
              border: "1px solid #edf0f4",
              borderRadius: "12px",
              boxShadow: "0 3px 10px rgba(16, 24, 43, 0.08)",
            }}
          >
            <Table sx={{ minWidth: 760 }}>
              <TableHead sx={{ display: "table-header-group" }}>
                <TableRow>
                  {["Logement", "Dates", "Montant", "Statut", "Paiement"].map(
                    (heading) => (
                      <TableCell
                        key={heading}
                        sx={{
                          py: 2,
                          color: "#111827",
                          fontWeight: 800,
                          borderBottom: "1px solid #e8ecf2",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentReservations.map((reservation) => {
                  const status =
                    STATUS_STYLES[reservation.statut] || DEFAULT_STATUS;
                  const payment =
                    PAYMENT_STYLES[reservation.paymentStatut] ||
                    DEFAULT_PAYMENT;

                  return (
                    <TableRow
                      key={reservation.id}
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                        "&:hover": { backgroundColor: "#fbfcfe" },
                      }}
                    >
                      <TableCell sx={{ py: 2.1, minWidth: 190 }}>
                        <MDTypography
                          variant="button"
                          fontWeight="medium"
                          sx={{ color: "#2f3f59" }}
                        >
                          {reservation.logementTitre ||
                            `Logement #${reservation.logementId}`}
                        </MDTypography>
                      </TableCell>
                      <TableCell sx={{ py: 2.1, minWidth: 190 }}>
                        <MDTypography
                          variant="button"
                          sx={{ color: "#3d4c63", lineHeight: 1.5 }}
                        >
                          {formatDate(reservation.dateDebut)} –{" "}
                          {formatDate(reservation.dateFin)}
                        </MDTypography>
                      </TableCell>
                      <TableCell sx={{ py: 2.1, minWidth: 140 }}>
                        <MDTypography
                          variant="button"
                          sx={{ color: "#3d4c63" }}
                        >
                          {formatAmount(reservation)}
                        </MDTypography>
                      </TableCell>
                      <TableCell sx={{ py: 2.1 }}>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            height: 25,
                            color: status.color,
                            backgroundColor: status.background,
                            fontWeight: 700,
                            fontSize: "0.68rem",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2.1 }}>
                        <Chip
                          label={payment.label}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 25,
                            color: payment.color,
                            borderColor: payment.border,
                            backgroundColor: "#fff",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </Card>
  );
}

RecentReservationsTable.propTypes = {
  reservations: PropTypes.arrayOf(PropTypes.object),
  onViewAll: PropTypes.func,
  emptyMessage: PropTypes.string,
  limit: PropTypes.number,
};

RecentReservationsTable.defaultProps = {
  reservations: [],
  onViewAll: null,
  emptyMessage: "Les nouvelles réservations apparaîtront ici.",
  limit: 5,
};

export default RecentReservationsTable;
