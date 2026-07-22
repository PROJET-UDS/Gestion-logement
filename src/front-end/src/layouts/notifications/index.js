import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { authHeaders, getUserRole } from "services/authService";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "http://localhost:8089";

function Notifications() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeMsg, setSubscribeMsg] = useState("");

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  const role = getUserRole();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (isAdmin) loadSubscribers();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubscribers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/newsletter/subscribers`, {
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      setError("Impossible de charger les abonnes");
    } finally {
      setLoading(false);
    }
  };

  const handlePublicSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscribeEmail }),
      });
      if (res.ok) {
        setSubscribeMsg("Inscription reussie !");
        setSubscribeEmail("");
      } else {
        const err = await res.json();
        setSubscribeMsg(err.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setSubscribeMsg("Erreur de connexion");
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendMsg("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/newsletter/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ subject, content }),
      });
      if (res.ok) {
        setSendMsg("Notification envoyee a tous les abonnes !");
        setSubject("");
        setContent("");
      } else {
        const err = await res.json();
        setSendMsg(err.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      setSendMsg("Erreur de connexion");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  S'abonner a la newsletter
                </MDTypography>
                <MDBox component="form" onSubmit={handlePublicSubscribe}>
                  <MDBox mb={2}>
                    <MDInput
                      type="email"
                      label="Votre adresse email"
                      fullWidth
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      required
                    />
                  </MDBox>
                  <MDButton variant="gradient" color="info" type="submit">
                    S'abonner
                  </MDButton>
                  {subscribeMsg && (
                    <MDTypography
                      variant="caption"
                      color={subscribeMsg.includes("reussie") ? "success" : "error"}
                      display="block"
                      mt={1}
                    >
                      {subscribeMsg}
                    </MDTypography>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {isAdmin && (
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h5" fontWeight="medium" mb={3}>
                    Envoyer une notification
                  </MDTypography>
                  <MDBox component="form" onSubmit={handleSendNotification}>
                    <MDBox mb={2}>
                      <MDInput
                        type="text"
                        label="Sujet"
                        fullWidth
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </MDBox>
                    <MDBox mb={2}>
                      <MDInput
                        type="text"
                        label="Contenu"
                        fullWidth
                        multiline
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                    </MDBox>
                    <MDButton
                      variant="gradient"
                      color="primary"
                      type="submit"
                      disabled={sending}
                    >
                      {sending ? "Envoi en cours..." : "Envoyer"}
                    </MDButton>
                    {sendMsg && (
                      <MDTypography
                        variant="caption"
                        color={sendMsg.includes("envoyee") ? "success" : "error"}
                        display="block"
                        mt={1}
                      >
                        {sendMsg}
                      </MDTypography>
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          )}
        </Grid>

        {isAdmin && (
          <Grid item xs={12} mt={3}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium" mb={3}>
                  Abonnes a la newsletter
                </MDTypography>
                {error && (
                  <MDBox mb={2}>
                    <MDAlert color="error">{error}</MDAlert>
                  </MDBox>
                )}
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>Date d'inscription</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subscribers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              Aucun abonne
                            </TableCell>
                          </TableRow>
                        ) : (
                          subscribers.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>{s.email}</TableCell>
                              <TableCell>{s.dateInscription || "-"}</TableCell>
                              <TableCell>{s.active ? "Actif" : "Inactif"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </MDBox>
            </Card>
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Notifications;
