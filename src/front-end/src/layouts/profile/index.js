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

function Profile() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8082/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNom(data.nom || "");
          setEmail(data.email || "");
          setTelephone(data.telephone || "");
        }
      } catch (err) {
        console.log("Impossible de charger le profil pour le moment");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8082/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom, email, telephone }),
      });
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" alignItems="center" mb={3}>
                  <MDAvatar src={burceMars} alt="profile-image" size="xl" shadow="sm" />
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
                    <MDTypography variant="caption" color="info" mt={2} display="block">
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
                      <MDButton variant="gradient" color="success" type="submit">
                        Enregistrer
                      </MDButton>
                    )}
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