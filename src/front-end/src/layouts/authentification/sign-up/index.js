import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentification/components/BasicLayout";
import bgImage from "assets/images/bg-sign-up-cover.jpeg";
import { register, saveAuthSession } from "services/authService";

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
      const data = await register({ nom, email, password });
      saveAuthSession(data);
      if (isReservationFlow) {
        navigate(`/annonces/${reserverLogementId}?reserver=1`, { replace: true });
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
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {isReservationFlow ? "Creer un compte pour reserver" : "Inscription"}
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
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Mot de passe"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2} p={2} bgColor="grey-100" borderRadius="md">
              <MDTypography variant="caption" color="text">
                {isReservationFlow
                  ? "Vous creez un compte client pour pouvoir reserver ce logement."
                  : "Vous creerez un compte client. Seul un administrateur peut attribuer un autre type de compte."}
              </MDTypography>
            </MDBox>
            {error && (
              <MDTypography variant="caption" color="error">
                {error}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "Inscription..." : "S'inscrire"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Deja un compte ?{" "}
                <MDTypography
                  component={Link}
                  to={isReservationFlow ? `/authentification/sign-in?redirect=/annonces/${reserverLogementId}?reserver=1` : "/authentification/sign-in"}
                  variant="button"
                  color="info"
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
