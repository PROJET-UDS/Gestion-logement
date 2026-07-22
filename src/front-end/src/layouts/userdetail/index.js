import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { API_BASE_URL, authHeaders } from "services/authService";
import burceMars from "assets/images/bruce-mars.jpg";

const ROLE_OPTIONS = [
  { value: "CLIENT", label: "Client" },
  { value: "PROPRIETAIRE", label: "Proprietaire" },
  { value: "ADMIN", label: "Administrateur" },
];

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState("");
  const [actif, setActif] = useState(true);
  const [photo, setPhoto] = useState(burceMars);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          headers: { ...authHeaders() },
        });
        if (response.ok) {
          const data = await response.json();
          setNom(data.nomComplet || "");
          setEmail(data.email || "");
          setTelephone(data.telephone || "");
          setRole(data.role || "CLIENT");
          setActif(data.actif !== false);
          if (data.photoUrl) setPhoto(data.photoUrl);
        } else {
          setMessage("Utilisateur introuvable");
        }
      } catch (err) {
        setMessage("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleRoleChange = async (newRole) => {
    if (newRole === role) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        setRole(newRole);
        setMessage("Role modifie avec succes !");
      } else {
        const err = await response.json();
        setMessage(err.message || "Erreur lors du changement de role");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const handleBanToggle = async () => {
    const action = actif ? "bannir" : "debannir";
    if (!window.confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/ban`, {
        method: "PATCH",
        headers: { ...authHeaders() },
      });
      if (response.ok) {
        const data = await response.json();
        setActif(data.actif);
        setMessage(data.actif ? "Utilisateur debanni !" : "Utilisateur banni !");
      } else {
        const err = await response.json();
        setMessage(err.message || "Erreur lors de l'action");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="button" color="text">Chargement...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

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
                  <MDAvatar src={photo} alt="user-photo" size="xl" shadow="sm" />
                  <MDBox ml={2} lineHeight={0}>
                    <MDTypography variant="h5" fontWeight="medium">
                      {nom || "Utilisateur"}
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      {email}
                    </MDTypography>
                    <MDBox>
                      <MDTypography
                        variant="caption"
                        color={actif ? "success" : "error"}
                        fontWeight="medium"
                      >
                        {actif ? "Actif" : "Banni"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Nom complet"
                      fullWidth
                      value={nom}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="email"
                      label="Email"
                      fullWidth
                      value={email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Telephone"
                      fullWidth
                      value={telephone}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      select
                      label="Role"
                      fullWidth
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>
                </Grid>

                {message && (
                  <MDTypography variant="caption" color={message.includes("succes") || message.includes("debanni") || message.includes("banni") ? "success" : "error"} mt={2} display="block">
                    {message}
                  </MDTypography>
                )}

                <MDBox mt={3} display="flex" gap={2}>
                  <MDButton
                    variant="gradient"
                    color={actif ? "error" : "success"}
                    type="button"
                    onClick={handleBanToggle}
                  >
                    {actif ? "Bannir" : "Debannir"}
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="dark"
                    type="button"
                    onClick={() => navigate("/tables")}
                  >
                    Retour
                  </MDButton>
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

export default UserDetail;
