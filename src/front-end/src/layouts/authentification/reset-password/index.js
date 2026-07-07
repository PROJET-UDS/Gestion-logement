import { useState } from "react";
import { Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Veuillez entrer votre adresse email.");
      return;
    }

    console.log("Demande de réinitialisation pour :", email);
    setMessage("Un lien de réinitialisation a été envoyé à votre email.");
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
            Réinitialiser le mot de passe
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Entrez votre email pour recevoir un lien de réinitialisation
          </Typography>

          {message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              type="email"
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button type="submit" variant="contained" color="info" fullWidth sx={{ mb: 2 }}>
              Envoyer le lien
            </Button>

            <Typography variant="body2" textAlign="center">
              Retour à la{" "}
              <Link to="/authentification/sign-in" style={{ color: "#1A73E8", fontWeight: 600 }}>
                page de connexion
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default ResetPassword;
