import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentification/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import { getDefaultRouteForRole, login, saveAuthSession } from "services/authService";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      const session = saveAuthSession(data);
      const redirectTo = location.state?.from?.pathname || getDefaultRouteForRole(session.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
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
            Connexion
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignIn}>
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
            <MDBox textAlign="right" mb={2}>
              <MDTypography
                component={Link}
                to="/authentification/reset-password"
                variant="button"
                color="info"
                fontWeight="medium"
              >
                Mot de passe oublié ?
              </MDTypography>
            </MDBox>
            {error && (
              <MDTypography variant="caption" color="error">
                {error}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Pas encore de compte ?{" "}
                <MDTypography
                  component={Link}
                  to="/authentification/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                >
                  S&apos;inscrire
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default SignIn;
