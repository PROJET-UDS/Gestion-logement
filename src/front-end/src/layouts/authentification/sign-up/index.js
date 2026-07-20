import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentification/components/BasicLayout";
import { register, saveAuthSession } from "services/authService";

const HOUSE_BG = "/images/billboard.jpg";

function SignUp() {
  const [searchParams] = useSearchParams();
  const reserverLogementId = searchParams.get("reserver");
  const isReservationFlow = !!reserverLogementId;

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register({
        nom: nom.trim(),
        email: email.trim(),
        password,
        role: "CLIENT",
      });
      saveAuthSession(data);
      if (isReservationFlow) {
        navigate(`/annonces/${reserverLogementId}?reserver=1`, {
          replace: true,
        });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={HOUSE_BG}>
      <Card>
        <MDBox
          variant="gradient"
          borderRadius="lg"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
          sx={{ background: "linear-gradient(195deg, #1a1a2e, #16213e)" }}
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {isReservationFlow
              ? "Créer un compte pour réserver"
              : "Inscription"}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignUp}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nom complet"
                fullWidth
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                autoComplete="name"
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Mot de passe"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                inputProps={{ minLength: 8 }}
                required
              />
            </MDBox>
            {isReservationFlow && (
              <MDBox mb={2} p={2} bgColor="grey-100" borderRadius="md">
                <MDTypography variant="caption" color="text">
                  Vous créez un compte client pour pouvoir réserver ce logement.
                </MDTypography>
              </MDBox>
            )}
            {error && (
              <MDTypography variant="caption" color="error">
                {error}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton
                type="submit"
                variant="gradient"
                color="warning"
                fullWidth
                disabled={loading}
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Déjà un compte ?{" "}
                <MDTypography
                  component={Link}
                  to={
                    isReservationFlow
                      ? `/authentification/sign-in?redirect=${encodeURIComponent(
                          `/annonces/${reserverLogementId}?reserver=1`
                        )}`
                      : "/authentification/sign-in"
                  }
                  variant="button"
                  color="warning"
                  fontWeight="medium"
                >
                  Se connecter
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default SignUp;
