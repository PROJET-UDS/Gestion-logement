import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Service API payment
import { creerpayment } from "api/paymentApi";

function payment() {
  const [formData, setFormData] = useState({
    montant: "",
    devise: "XAF",
    moyenpayment: "MOBILE_MONEY",
    reservationId: "",
  });

  const [statut, setStatut] = useState(null); // "success" | "error" | null
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
  if (!formData.montant || Number(formData.montant) <= 0) {
    setStatut("error");
    setMessage("Le montant doit être un nombre supérieur à 0.");
    return false;
  }
  if (!formData.reservationId.trim()) {
    setStatut("error");
    setMessage("L'ID Réservation est obligatoire.");
    return false;
  }
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);
  setStatut(null);

  try {
    const response = await creerpayment(formData);
    setStatut("success");
    setMessage(`payment créé avec succès ! ID: ${response.data.id}`);
  } catch (error) {
    setStatut("error");
    setMessage(
      "Erreur lors de la création du payment. Le backend n'est peut-être pas encore disponible."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  Nouveau payment
                </MDTypography>

                {statut && (
                  <MDBox mb={2}>
                    <MDAlert color={statut === "success" ? "success" : "error"}>
                      {message}
                    </MDAlert>
                  </MDBox>
                )}

                <MDBox component="form" role="form" onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <MDInput
                      type="number"
                      label="Montant"
                      name="montant"
                      value={formData.montant}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </MDBox>

                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Devise"
                      name="devise"
                      value={formData.devise}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </MDBox>

                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Moyen de payment"
                      name="moyenpayment"
                      value={formData.moyenpayment}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </MDBox>

                  <MDBox mb={3}>
                    <MDInput
                      type="text"
                      label="ID Réservation"
                      name="reservationId"
                      value={formData.reservationId}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </MDBox>

                  <MDBox display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="gradient"
                      color="info"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Envoi en cours..." : "Payer"}
                    </MDButton>
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

export default payment;