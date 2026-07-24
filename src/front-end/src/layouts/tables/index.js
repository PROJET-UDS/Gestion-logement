import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate } from "react-router-dom";
import burceMars from "assets/images/bruce-mars.jpg";
import { API_BASE_URL, authHeaders } from "services/authService";

function Tables() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [message, setMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userASupprimer, setUserASupprimer] = useState(null);
  const [suppressionLoading, setSuppressionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: authHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setUtilisateurs(data);
      } else {
        setMessage("Impossible de charger la liste des utilisateurs");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSupprimer = async () => {
    if (!userASupprimer) return;
    setSuppressionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/users/${encodeURIComponent(userASupprimer.id)}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Erreur lors de la suppression");
      }
      setUtilisateurs((prev) => prev.filter((u) => u.id !== userASupprimer.id));
      setDeleteDialogOpen(false);
      setUserASupprimer(null);
    } catch (err) {
      setMessage(err.message || "Erreur lors de la suppression");
    } finally {
      setSuppressionLoading(false);
    }
  };

  // Filtrer les utilisateurs selon la recherche (nom ou email)
  const utilisateursFiltres = utilisateurs.filter((user) => {
    const texteRecherche = recherche.toLowerCase();
    return (
      user.nomComplet?.toLowerCase().includes(texteRecherche) ||
      user.email?.toLowerCase().includes(texteRecherche)
    );
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={2}
            borderRadius="lg"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              background: "linear-gradient(135deg, #101a33 0%, #1e315c 100%)",
              boxShadow: "0 12px 28px rgba(16, 26, 51, 0.22)",
            }}
          >
            <MDBox>
              <MDTypography variant="h5" color="white" fontWeight="bold">
                Utilisateurs
              </MDTypography>
              <MDTypography variant="button" color="white" opacity={0.78}>
                Consultez les comptes et attribuez leurs rôles.
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox pt={3} px={2}>
            <MDBox mb={2} maxWidth="300px">
              <MDInput
                type="text"
                label="Rechercher par nom ou email"
                fullWidth
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </MDBox>

            {message && (
              <MDTypography variant="caption" color="error" mb={2} display="block">
                {message}
              </MDTypography>
            )}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Photo</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {utilisateursFiltres.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <MDTypography variant="button" color="text">
                          Aucun utilisateur trouvé
                        </MDTypography>
                      </TableCell>
                    </TableRow>
                  )}
                  {utilisateursFiltres.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <MDAvatar src={user.photoUrl || burceMars} size="sm" />
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="button" fontWeight="medium">
                          {user.nomComplet || "Utilisateur"}
                        </MDTypography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telephone || "—"}</TableCell>
                      <TableCell>{user.role || "Utilisateur"}</TableCell>
                      <TableCell align="center">
                        <MDButton
                          variant="text"
                          color="warning"
                          onClick={() => navigate(`/tables/${user.id}`)}
                        >
                          Gérer le rôle
                        </MDButton>
                        <MDButton
                          variant="text"
                          color="error"
                          onClick={() => { setUserASupprimer(user); setDeleteDialogOpen(true); }}
                        >
                          Supprimer
                        </MDButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">
            Voulez-vous vraiment supprimer l&apos;utilisateur <strong>{userASupprimer?.nomComplet || userASupprimer?.email}</strong> ? Cette action est irreversible.
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Annuler
          </MDButton>
          <MDButton onClick={handleSupprimer} color="error" disabled={suppressionLoading}>
            {suppressionLoading ? <CircularProgress size={20} /> : "Supprimer"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Tables;
