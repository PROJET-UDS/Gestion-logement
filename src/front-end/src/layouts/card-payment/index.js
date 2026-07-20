import { useState } from "react";
import { useSearchParams } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API and auth
import { payByCard } from "api/paiementApi";
import { getUserId } from "services/authService";

// Luhn algorithm validation
function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

// Format card number with spaces every 4 digits
function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : "";
}

// Format expiry date as MM/YY
function formatExpiryDate(value) {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
  }
  return cleaned;
}

// Generate a simple idempotency key
function generateIdempotencyKey() {
  return "idem_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
}

function CardPayment() {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservationId") || "";
  const amountParam = searchParams.get("amount") || "";

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount] = useState(amountParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleCvvChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(cleaned);
  };

  const validateForm = () => {
    if (!cardholderName.trim()) return "Le nom du titulaire est requis";
    if (!cardNumber.trim()) return "Le numero de carte est requis";
    if (!luhnCheck(cardNumber)) return "Le numero de carte est invalide";
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) return "La date d'expiration doit etre au format MM/YY";
    const [month] = expiryDate.split("/").map(Number);
    if (month < 1 || month > 12) return "Le mois d'expiration est invalide";
    if (cvv.length !== 3) return "Le CVV doit contenir 3 chiffres";
    if (!reservationId) return "L'identifiant de reservation est manquant";
    if (!amount || isNaN(Number(amount))) return "Le montant est invalide";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();
      const data = {
        reservationId,
        userId,
        amount: Number(amount),
        cardholderName: cardholderName.trim(),
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiryDate,
        cvv,
        idempotencyKey: generateIdempotencyKey(),
      };
      await payByCard(data);
      setSuccess("Paiement effectue avec succes !");
    } catch (err) {
      setError(err.message || "Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar absolute isMini />
      <MDBox mt={8} mb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h4" fontWeight="medium" mb={2}>
                  Paiement par carte
                </MDTypography>

                {error && (
                  <MDBox mb={2}>
                    <MDAlert color="error" dismissible>
                      {error}
                    </MDAlert>
                  </MDBox>
                )}

                {success && (
                  <MDBox mb={2}>
                    <MDAlert color="success" dismissible>
                      {success}
                    </MDAlert>
                  </MDBox>
                )}

                <MDBox component="form" onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <TextField
                      fullWidth
                      label="Nom du titulaire"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      disabled={loading || !!success}
                    />
                  </MDBox>

                  <MDBox mb={2}>
                    <TextField
                      fullWidth
                      label="Numero de carte"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      inputProps={{ maxLength: 19 }}
                      disabled={loading || !!success}
                    />
                  </MDBox>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MDBox mb={2}>
                        <TextField
                          fullWidth
                          label="Date d'expiration"
                          value={expiryDate}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          inputProps={{ maxLength: 5 }}
                          disabled={loading || !!success}
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={6}>
                      <MDBox mb={2}>
                        <TextField
                          fullWidth
                          label="CVV"
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          type="password"
                          inputProps={{ maxLength: 3 }}
                          disabled={loading || !!success}
                        />
                      </MDBox>
                    </Grid>
                  </Grid>

                  <MDBox mb={2}>
                    <TextField
                      fullWidth
                      label="Montant (FCFA)"
                      value={amount}
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                  </MDBox>

                  <MDBox mb={2}>
                    <MDButton
                      variant="gradient"
                      color="info"
                      fullWidth
                      type="submit"
                      disabled={loading || !!success}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Payer"}
                    </MDButton>
                  </MDBox>

                  <MDBox mt={2} p={2} bgColor="grey-100" borderRadius="lg">
                    <MDTypography variant="caption" color="text">
                      <strong>Cartes de test:</strong>
                      <br />
                      4242 4242 4242 4242 (succes)
                      <br />
                      4000 0000 0000 0002 (refusee)
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CardPayment;
