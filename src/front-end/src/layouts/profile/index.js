import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import burceMars from "assets/images/bruce-mars.jpg";

const API_BASE_URL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE_URL) ||
  "http://localhost:8089";

function Profile() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState(burceMars);
  const [photoFile, setPhotoFile] = useState(null);

  // Champs pour le changement de mot de passe
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNom(data.nom || "");
          setEmail(data.email || "");
          setTelephone(data.telephone || "");
          if (data.photoUrl) setPhoto(data.photoUrl);
        }
      } catch (err) {
        console.log("Impossible de charger le profil pour le moment");
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom, email, telephone }),
      });

      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);
        await fetch(`${API_BASE_URL}/users/me/photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (response.ok) {
        setMessage("Profil mis à jour avec succès !");
        setIsEditing(false);
      } else {
        setMessage("Erreur lors de la mise à jour");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (nouveauMotDePasse !== confirmerMotDePasse) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: ancienMotDePasse,
          newPassword: nouveauMotDePasse,
        }),
      });

      if (response.ok) {
        setPasswordMessage("Mot de passe changé avec succès !");
        setAncienMotDePasse("");
        setNouveauMotDePasse("");
        setConfirmerMotDePasse("");
      } else {
        setPasswordError("Ancien mot de passe incorrect");
      }
    } catch (err) {
      setPasswordError("Erreur de connexion au serveur");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <MDBox mb={3}>
        <Grid container spacing={3}>
          {/* Carte Informations personnelles */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" alignItems="center" mb={3}>
                  <MDBox position="relative">
                    <MDAvatar
                      src={photo}
                      alt="profile-image"
                      size="xl"
                      shadow="sm"
                    />
                    {isEditing && (
                      <MDBox
                        component="label"
                        htmlFor="photo-upload"
                        position="absolute"
                        bottom={0}
                        right={0}
                        bgColor="info"
                        borderRadius="50%"
                        width="28px"
                        height="28px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{ cursor: "pointer" }}
                      >
                        <MDTypography
                          variant="button"
                          color="white"
                          fontSize="14px"
                        >
                          ✎
                        </MDTypography>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          style={{ display: "none" }}
                        />
                      </MDBox>
                    )}
                  </MDBox>
                  <MDBox ml={2} lineHeight={0}>
                    <MDTypography variant="h5" fontWeight="medium">
                      {nom || "Mon Profil"}
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      {email}
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox component="form" role="form" onSubmit={handleSave}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="Nom complet"
                        fullWidth
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="email"
                        label="Email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        type="text"
                        label="Téléphone"
                        fullWidth
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>

                  {message && (
                    <MDTypography
                      variant="caption"
                      color="info"
                      mt={2}
                      display="block"
                    >
                      {message}
                    </MDTypography>
                  )}

                  <MDBox mt={3} display="flex" gap={2}>
                    {!isEditing ? (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => setIsEditing(true)}
                        type="button"
                      >
                        Modifier
                      </MDButton>
                    ) : (
                      <MDButton
                        variant="gradient"
                        color="success"
                        type="submit"
                      >
                        Enregistrer
                      </MDButton>
                    )}
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Carte Changer le mot de passe */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Changer le mot de passe
                </MDTypography>
                <MDBox
                  component="form"
                  role="form"
                  onSubmit={handleChangePassword}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <MDInput
                        type="password"
                        label="Mot de passe actuel"
                        fullWidth
                        value={ancienMotDePasse}
                        onChange={(e) => setAncienMotDePasse(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDInput
                        type="password"
                        label="Nouveau mot de passe"
                        fullWidth
                        value={nouveauMotDePasse}
                        onChange={(e) => setNouveauMotDePasse(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDInput
                        type="password"
                        label="Confirmer le mot de passe"
                        fullWidth
                        value={confirmerMotDePasse}
                        onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  {passwordMessage && (
                    <MDTypography
                      variant="caption"
                      color="success"
                      mt={2}
                      display="block"
                    >
                      {passwordMessage}
                    </MDTypography>
                  )}
                  {passwordError && (
                    <MDTypography
                      variant="caption"
                      color="error"
                      mt={2}
                      display="block"
                    >
                      {passwordError}
                    </MDTypography>
                  )}

                  <MDBox mt={3}>
                    <MDButton variant="gradient" color="info" type="submit">
                      Changer le mot de passe
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

export default Profile;
