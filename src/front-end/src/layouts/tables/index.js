import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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

function Tables() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8082/api/users", {
          headers: { Authorization: `Bearer ${token}` },
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
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
      } else {
        setMessage("Erreur lors de la suppression");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  // Filtrer les utilisateurs selon la recherche (nom ou email)
  const utilisateursFiltres = utilisateurs.filter((user) => {
    const texteRecherche = recherche.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(texteRecherche) ||
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
                          {user.nom}
                        </MDTypography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telephone}</TableCell>
                      <TableCell>{user.role || "Utilisateur"}</TableCell>
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
                          color="error"
                          onClick={() => handleDelete(user.id)}
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
    </DashboardLayout>
  );
}

export default Tables;