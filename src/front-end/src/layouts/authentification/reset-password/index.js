import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "services/authService";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

const STEPS = ["Email", "Code", "Nouveau mot de passe"];
const CODE_EXPIRY_SECONDS = 180;
const MAX_RESENDS = 5;

function ResetPassword() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(CODE_EXPIRY_SECONDS);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Erreur lors de l'envoi du code");
      }
      setStep(1);
      setCountdown(CODE_EXPIRY_SECONDS);
      setResendCount(0);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCount >= MAX_RESENDS) {
      setError("Nombre maximum de renvois atteint. Reessayez plus tard.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Erreur lors du renvoi du code");
      }
      setCountdown(CODE_EXPIRY_SECONDS);
      setCanResend(false);
      setResendCount((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Veuillez entrer un code a 6 chiffres");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Erreur lors de la reinitialisation");
      }
      setStep(2);
      setSuccess("Votre mot de passe a ete reinitialise avec succes !");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(195deg, #42424a 0%, #191919 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
            Reinitialiser le mot de passe
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            {step === 0 && "Entrez votre email pour recevoir un code de recuperation"}
            {step === 1 && "Entrez le code recu et votre nouveau mot de passe"}
            {step === 2 && "Votre mot de passe a ete modifie"}
          </Typography>

          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && step === 2 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {step === 0 && (
            <Box component="form" onSubmit={handleSendCode}>
              <TextField
                type="email"
                label="Adresse email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
                autoFocus
              />
              <Button
                type="submit"
                variant="contained"
                color="info"
                fullWidth
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Envoyer le code"}
              </Button>
            </Box>
          )}

          {step === 1 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    color: countdown > 0 ? "#059669" : "#dc2626",
                    fontFamily: "monospace",
                  }}
                >
                  {formatTime(countdown)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {countdown > 0 ? "temps restant" : "Code expire"}
                </Typography>
              </Box>

              <TextField
                label="Code de verification"
                variant="outlined"
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    fontSize: "24px",
                    letterSpacing: "8px",
                    fontWeight: "bold",
                  },
                }}
                placeholder="000000"
                sx={{ mb: 2 }}
                autoFocus
              />

              <TextField
                type="password"
                label="Nouveau mot de passe"
                variant="outlined"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                type="password"
                label="Confirmer le mot de passe"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="info"
                fullWidth
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Reinitialiser le mot de passe"}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                disabled={loading || (!canResend && countdown > 0) || resendCount >= MAX_RESENDS}
                onClick={handleResendCode}
                sx={{ mb: 2 }}
              >
                {resendCount >= MAX_RESENDS
                  ? "Renvoi maximum atteint"
                  : canResend
                  ? `Renvoyer le code (${MAX_RESENDS - resendCount} restant${MAX_RESENDS - resendCount > 1 ? "s" : ""})`
                  : `Renvoyer dans ${formatTime(countdown)}`}
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                color="info"
                component={Link}
                to="/authentification/sign-in"
                sx={{ mt: 2 }}
              >
                Se connecter
              </Button>
            </Box>
          )}

          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Retour a la{" "}
            <Link to="/authentification/sign-in" style={{ color: "#1A73E8", fontWeight: 600 }}>
              page de connexion
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

export default ResetPassword;
