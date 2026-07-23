import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import burceMars from "assets/images/bruce-mars.jpg";
import {
  API_BASE_URL,
  authHeaders,
  changeUserRole,
} from "services/authService";

const ROLE_OPTIONS = [
  { value: "CLIENT", label: "Utilisateur" },
  { value: "PROPRIETAIRE", label: "Propriétaire" },
  { value: "ADMIN", label: "Administrateur" },
];

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      setLoading(true);
      setMessage("");
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/${encodeURIComponent(id)}`,
          { headers: authHeaders() }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || "Utilisateur introuvable");
        }
        if (active) {
          setUser(data);
          setRole(data.role || "CLIENT");
        }
      } catch (error) {
        if (active) {
          setIsError(true);
          setMessage(error.message || "Erreur de connexion au serveur");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchUser();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      await changeUserRole(id, role);
      setUser((current) => ({ ...current, role }));
      setMessage("Le rôle a été mis à jour. L’utilisateur devra se reconnecter.");
      setIsEditing(false);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setRole(user?.role || "CLIENT");
    setIsEditing(false);
    setMessage("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card sx={{ overflow: "visible" }}>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={3}
            borderRadius="lg"
            sx={{
              background: "linear-gradient(135deg, #101a33 0%, #1e315c 100%)",
              boxShadow: "0 12px 28px rgba(16, 26, 51, 0.22)",
            }}
          >
            <MDTypography variant="h5" color="white" fontWeight="bold">
              Gestion du compte
            </MDTypography>
            <MDTypography variant="button" color="white" opacity={0.78}>
              Seul le rôle du compte peut être modifié depuis cet espace.
            </MDTypography>
          </MDBox>

          <MDBox component="form" onSubmit={handleSave} p={3}>
            {loading ? (
              <MDTypography variant="button" color="text">
                Chargement de l’utilisateur...
              </MDTypography>
            ) : user ? (
              <>
                <MDBox display="flex" alignItems="center" mb={4}>
                  <MDAvatar
                    src={user.photoUrl || burceMars}
                    alt={user.nomComplet || "Utilisateur"}
                    size="xl"
                    shadow="md"
                  />
                  <MDBox ml={2}>
                    <MDTypography variant="h5" fontWeight="medium">
                      {user.nomComplet || "Utilisateur"}
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      {user.email}
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      label="Nom complet"
                      fullWidth
                      value={user.nomComplet || ""}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="email"
                      label="Email"
                      fullWidth
                      value={user.email || ""}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      label="Téléphone"
                      fullWidth
                      value={user.telephone || "Non renseigné"}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      select
                      label="Rôle"
                      fullWidth
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      disabled={!isEditing}
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
                  <MDTypography
                    variant="button"
                    color={isError ? "error" : "success"}
                    mt={2.5}
                    display="block"
                  >
                    {message}
                  </MDTypography>
                )}

                <MDBox mt={3.5} display="flex" gap={1.5} flexWrap="wrap">
                  {!isEditing ? (
                    <MDButton
                      variant="gradient"
                      color="warning"
                      type="button"
                      onClick={() => {
                        setMessage("");
                        setIsEditing(true);
                      }}
                    >
                      Modifier le rôle
                    </MDButton>
                  ) : (
                    <>
                      <MDButton
                        variant="gradient"
                        color="warning"
                        type="submit"
                        disabled={saving || role === user.role}
                      >
                        {saving ? "Enregistrement..." : "Enregistrer"}
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="dark"
                        type="button"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        Annuler
                      </MDButton>
                    </>
                  )}
                  <MDButton
                    variant="text"
                    color="dark"
                    type="button"
                    onClick={() => navigate("/tables")}
                  >
                    Retour à la liste
                  </MDButton>
                </MDBox>
              </>
            ) : (
              <>
                <MDTypography variant="button" color="error">
                  {message || "Utilisateur introuvable"}
                </MDTypography>
                <MDBox mt={2}>
                  <MDButton
                    variant="outlined"
                    color="dark"
                    onClick={() => navigate("/tables")}
                  >
                    Retour à la liste
                  </MDButton>
                </MDBox>
              </>
            )}
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserDetail;
