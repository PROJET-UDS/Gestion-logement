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
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authHeaders } from "services/authService";
import burceMars from "assets/images/bruce-mars.jpg";

const ROLE_OPTIONS = [
  { value: "CLIENT", label: "Client" },
  { value: "PROPRIETAIRE", label: "Proprietaire" },
  { value: "ADMIN", label: "Administrateur" },
];

function Tables() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [openCreate, setOpenCreate] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", nom: "", password: "", role: "CLIENT" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { ...authHeaders() },
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

  const handleBan = async (userId, currentlyActive) => {
    const action = currentlyActive ? "bannir" : "debannir";
    if (!window.confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
        method: "PATCH",
        headers: { ...authHeaders() },
      });
      if (response.ok) {
        fetchUsers();
      } else {
        setMessage("Erreur lors de l'action");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        setOpenCreate(false);
        setNewUser({ email: "", nom: "", password: "", role: "CLIENT" });
        setMessage("Utilisateur cree avec succes !");
        fetchUsers();
      } else {
        const err = await response.json();
        setMessage(err.message || "Erreur lors de la creation");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    } finally {
      setCreating(false);
    }
  };

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
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <MDTypography variant="h6" color="white">
              Liste des Utilisateurs
            </MDTypography>
            <MDButton
              variant="gradient"
              color="white"
              onClick={() => setOpenCreate(true)}
            >
              + Creer un utilisateur
            </MDButton>
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
              <MDTypography variant="caption" color={message.includes("succes") ? "success" : "error"} mb={2} display="block">
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
                    <TableCell>Telephone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {utilisateursFiltres.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <MDTypography variant="button" color="text">
                          Aucun utilisateur trouve
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
                          {user.nomComplet}
                        </MDTypography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telephone}</TableCell>
                      <TableCell>{user.role || "Utilisateur"}</TableCell>
                      <TableCell>
                        <MDTypography
                          variant="caption"
                          color={user.actif !== false ? "success" : "error"}
                          fontWeight="medium"
                        >
                          {user.actif !== false ? "Actif" : "Banni"}
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDButton
                          variant="text"
                          color="info"
                          onClick={() => navigate(`/tables/${user.id}`)}
                        >
                          Voir
                        </MDButton>
                        <MDButton
                          variant="text"
                          color={user.actif !== false ? "error" : "success"}
                          onClick={() => handleBan(user.id, user.actif !== false)}
                        >
                          {user.actif !== false ? "Bannir" : "Debannir"}
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

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Creer un nouvel utilisateur</DialogTitle>
        <DialogContent>
          <MDBox component="form" onSubmit={handleCreateUser} pt={1}>
            <MDBox mb={2} mt={2}>
              <MDInput
                type="text"
                label="Nom complet"
                fullWidth
                value={newUser.nom}
                onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Mot de passe"
                fullWidth
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                select
                label="Role"
                fullWidth
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </MDInput>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenCreate(false)} color="dark">
            Annuler
          </MDButton>
          <MDButton onClick={handleCreateUser} color="success" disabled={creating}>
            {creating ? "Creation..." : "Creer"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
