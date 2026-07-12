import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate } from "react-router-dom";

function Logements() {
  const [logements, setLogements] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8083/api/logements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Si l'API renvoie une réponse paginée (content: [...]), on gère les deux cas
          setLogements(data.content || data);
        } else {
          setMessage("Impossible de charger la liste des logements");
        }
      } catch (err) {
        setMessage("Erreur de connexion au serveur");
      }
    };
    fetchLogements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce logement ?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8083/api/logements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setLogements(logements.filter((l) => l.id !== id));
      } else {
        setMessage("Erreur lors de la suppression");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const logementsFiltres = logements.filter((l) => {
    const texte = recherche.toLowerCase();
    return (
      l.titre?.toLowerCase().includes(texte) ||
      l.quartier?.toLowerCase().includes(texte) ||
      l.type?.toLowerCase().includes(texte)
    );
  });

  const couleurStatut = (statut) => {
    if (statut === "SUSPENDU") return "error";
    if (statut === "ACTIF") return "success";
    return "secondary";
  };

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
              Liste des Logements
            </MDTypography>
            <MDButton
              variant="gradient"
              color="dark"
              size="small"
              onClick={() => navigate("/logements/ajouter")}
            >
              + Ajouter un logement
            </MDButton>
          </MDBox>

          <MDBox pt={3} px={2}>
            <MDBox mb={2} maxWidth="300px">
              <MDInput
                type="text"
                label="Rechercher par titre, quartier ou type"
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
                    <TableCell>Titre</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Prix</TableCell>
                    <TableCell>Quartier</TableCell>
                    <TableCell>Proximité</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logementsFiltres.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <MDTypography variant="button" color="text">
                          Aucun logement trouvé
                        </MDTypography>
                      </TableCell>
                    </TableRow>
                  )}
                  {logementsFiltres.map((logement) => (
                    <TableRow key={logement.id}>
                      <TableCell>
                        <MDTypography variant="button" fontWeight="medium">
                          {logement.titre}
                        </MDTypography>
                      </TableCell>
                      <TableCell>{logement.type}</TableCell>
                      <TableCell>
                        {logement.prix ? `${logement.prix} FCFA` : "-"}
                      </TableCell>
                      <TableCell>{logement.quartier}</TableCell>
                      <TableCell>
                        {logement.pointInteret
                          ? `${logement.pointInteret} (${logement.distanceMetres || "?"} m)`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {logement.noteMoyenne ? `⭐ ${logement.noteMoyenne.toFixed(1)}` : "Aucun avis"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={logement.statut || "ACTIF"}
                          color={couleurStatut(logement.statut)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <MDButton
                          variant="text"
                          color="info"
                          onClick={() => navigate(`/logements/${logement.id}`)}
                        >
                          Voir
                        </MDButton>
                        <MDButton
                          variant="text"
                          color="error"
                          onClick={() => handleDelete(logement.id)}
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

export default Logements;