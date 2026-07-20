import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentification/components/BasicLayout";
import {
  getDefaultRouteForRole,
  login,
  saveAuthSession,
} from "services/authService";

const HOUSE_BG = "/images/billboard.jpg";

const getSafeRedirect = (redirect) =>
  redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password });
      const session = saveAuthSession(data);
      const redirectTo =
        getSafeRedirect(redirectParam) ||
        getSafeRedirect(location.state?.from?.pathname) ||
        getDefaultRouteForRole(session.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
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
                autoComplete="current-password"
                required
              />
            </MDBox>
            <MDBox textAlign="right" mb={2}>
              <MDTypography
                component={Link}
                to="/authentification/reset-password"
                variant="button"
                color="warning"
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
              <MDButton
                type="submit"
                variant="gradient"
                color="warning"
                fullWidth
                disabled={loading}
              >
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
                  color="warning"
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
