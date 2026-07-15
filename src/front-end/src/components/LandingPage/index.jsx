import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";

import PageLayout from "examples/LayoutContainers/PageLayout";
import { getLogementsPublic, getFileUrl } from "api/logementApi";

function LandingPage() {
  const navigate = useNavigate();
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchVille, setSearchVille] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchTransaction, setSearchTransaction] = useState("");

  useEffect(() => {
    getLogementsPublic()
      .then((data) => setLogements(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchVille) params.set("ville", searchVille);
    if (searchType) params.set("typeLogement", searchType);
    if (searchTransaction) params.set("typeTransaction", searchTransaction);
    navigate(`/annonces${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <PageLayout>
      <div style={{ fontFamily: "sans-serif", margin: 0, padding: 0 }}>

        <nav style={{ backgroundColor: "#1a1a2e", padding: "20px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", width: "100%", top: 0, zIndex: 1000 }}>
          <h1 style={{ color: "#f0a500", fontSize: "50px", fontWeight: "bold", margin: 0 }}>SearcHome</h1>
          <div>
            <a href="#accueil" style={{ color: "white", marginRight: 20, textDecoration: "none" }}>Accueil</a>
            <a href="#proprietes" style={{ color: "white", marginRight: 20, textDecoration: "none" }}>Propriétés</a>
            <a href="#apropos" style={{ color: "white", marginRight: 20, textDecoration: "none" }}>À propos</a>
            <a href="#contact" style={{ color: "white", marginRight: 20, textDecoration: "none" }}>Contact</a>
            <Link to="/authentification/sign-in" style={{ backgroundColor: "#f0a500", color: "white", padding: "10px 20px", borderRadius: "25px", textDecoration: "none", marginLeft: 10 }}>Connexion</Link>
            <Link to="/authentification/sign-up" style={{ backgroundColor: "transparent", color: "white", padding: "10px 20px", borderRadius: "25px", textDecoration: "none", border: "1px solid white", marginLeft: 10 }}>Inscription</Link>
          </div>
        </nav>

        <div id="accueil" style={{ backgroundColor: "#1a1a2e", padding: "150px 50px 100px", textAlign: "left", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ color: "white", fontSize: "56px", fontWeight: "bold", marginBottom: 20 }}>Trouvez Votre<br/>Logement Idéal</h2>
          <p style={{ color: "#ccc", fontSize: 18, marginBottom: 40, maxWidth: 600 }}>Plateforme de gestion de logements simple et efficace. Trouvez, réservez et gérez vos logements en toute simplicité.</p>

          <form onSubmit={handleSearch} style={{ backgroundColor: "white", padding: 20, borderRadius: 10, display: "flex", gap: 10, maxWidth: 700 }}>
            <select value={searchTransaction} onChange={(e) => setSearchTransaction(e.target.value)} style={{ padding: 10, borderRadius: 5, border: "1px solid #ccc", flex: 1 }}>
              <option value="">Objectif</option>
              <option value="LOCATION">Louer</option>
              <option value="VENTE">Acheter</option>
            </select>
            <select value={searchVille} onChange={(e) => setSearchVille(e.target.value)} style={{ padding: 10, borderRadius: 5, border: "1px solid #ccc", flex: 1 }}>
              <option value="">Localisation</option>
              <option value="Yaoundé">Yaoundé</option>
              <option value="Douala">Douala</option>
              <option value="Bafoussam">Bafoussam</option>
              <option value="Bamenda">Bamenda</option>
            </select>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ padding: 10, borderRadius: 5, border: "1px solid #ccc", flex: 1 }}>
              <option value="">Type</option>
              <option value="APPARTEMENT">Appartement</option>
              <option value="MAISON">Villa</option>
              <option value="STUDIO">Studio</option>
              <option value="CHAMBRE">Chambre</option>
            </select>
            <button type="submit" style={{ backgroundColor: "#f0a500", color: "white", padding: "10px 30px", borderRadius: 5, border: "none", cursor: "pointer", fontWeight: "bold" }}>Rechercher</button>
          </form>
        </div>

        <div id="proprietes" style={{ padding: "80px 50px", backgroundColor: "#f8f9fa" }}>
          <h2 style={{ textAlign: "center", fontSize: 36, marginBottom: 10 }}>Nos Propriétés</h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 50 }}>Découvrez nos logements disponibles</p>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <CircularProgress />
            </div>
          ) : logements.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
              <Icon sx={{ fontSize: 60, color: "#ccc" }}>home</Icon>
              <p style={{ marginTop: 10 }}>Aucun logement disponible pour le moment</p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 30, justifyContent: "center", flexWrap: "wrap" }}>
              {logements.map((logement) => (
                <div
                  key={logement.id}
                  onClick={() => navigate(`/annonces/${logement.id}`)}
                  style={{ backgroundColor: "white", borderRadius: 10, padding: 20, width: 300, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", cursor: "pointer" }}
                >
                  {logement.medias && logement.medias.length > 0 ? (
                    <img
                      src={getFileUrl(logement.medias[0].fileUrl)}
                      alt={logement.titre}
                      style={{ width: "100%", height: 200, borderRadius: 8, objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ backgroundColor: "#1a1a2e", height: 200, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#f0a500", fontSize: 50 }}>&#127968;</span>
                    </div>
                  )}
                  <span style={{ backgroundColor: "#f0a500", color: "white", padding: "5px 10px", borderRadius: 5, fontSize: 12, display: "inline-block", marginTop: 10 }}>
                    {logement.typeLogement}
                  </span>
                  <h3 style={{ marginTop: 10, fontSize: 18 }}>{logement.titre}</h3>
                  <p style={{ color: "#666" }}>&#128205; {logement.ville}{logement.quartier ? `, ${logement.quartier}` : ""}</p>
                  <p style={{ color: "#f0a500", fontWeight: "bold", fontSize: 18 }}>
                    {Number(logement.prix).toLocaleString("fr-FR")} FCFA
                    {logement.typeTransaction === "LOCATION" && <span style={{ fontWeight: "normal", fontSize: 12 }}>/mois</span>}
                  </p>
                  <button style={{ backgroundColor: "#1a1a2e", color: "white", padding: "10px 20px", borderRadius: 5, border: "none", cursor: "pointer", width: "100%", marginTop: 10 }}>Voir détails</button>
                </div>
              ))}
            </div>
          )}

          {logements.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link to="/annonces" style={{ backgroundColor: "#1a1a2e", color: "white", padding: "15px 30px", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", display: "inline-block" }}>
                Voir toutes les annonces
              </Link>
            </div>
          )}
        </div>

        <div id="apropos" style={{ padding: "80px 50px", backgroundColor: "white", display: "flex", gap: 50, alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 500 }}>
            <h2 style={{ fontSize: 36, marginBottom: 20 }}>À Propos de Nous</h2>
            <p style={{ color: "#666", lineHeight: 1.8, marginBottom: 20 }}>Nous sommes une plateforme dédiée à la gestion de logements au Cameroun. Notre mission est de simplifier la recherche et la gestion de logements pour les propriétaires et les locataires.</p>
            <p style={{ color: "#666", lineHeight: 1.8, marginBottom: 30 }}>Avec notre système, vous pouvez gérer vos propriétés, suivre les paiements et communiquer facilement avec vos locataires.</p>
            <Link to="/authentification/sign-up" style={{ backgroundColor: "#f0a500", color: "white", padding: "15px 30px", borderRadius: "25px", textDecoration: "none", fontWeight: "bold" }}>Commencer maintenant</Link>
          </div>
          <div style={{ backgroundColor: "#1a1a2e", width: 400, height: 300, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 100 }}>&#127969;&#65039;</span>
          </div>
        </div>

        <div id="contact" style={{ padding: "80px 50px", backgroundColor: "#f8f9fa", textAlign: "center" }}>
          <h2 style={{ fontSize: 36, marginBottom: 10 }}>Contactez-Nous</h2>
          <p style={{ color: "#666", marginBottom: 50 }}>Nous sommes là pour vous aider</p>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <input type="text" placeholder="Votre nom" style={{ width: "100%", padding: 15, marginBottom: 15, borderRadius: 5, border: "1px solid #ccc", boxSizing: "border-box" }} />
            <input type="email" placeholder="Votre email" style={{ width: "100%", padding: 15, marginBottom: 15, borderRadius: 5, border: "1px solid #ccc", boxSizing: "border-box" }} />
            <textarea placeholder="Votre message" rows="5" style={{ width: "100%", padding: 15, marginBottom: 15, borderRadius: 5, border: "1px solid #ccc", boxSizing: "border-box" }}></textarea>
            <button style={{ backgroundColor: "#f0a500", color: "white", padding: "15px 50px", borderRadius: "25px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 16 }}>Envoyer</button>
          </div>
        </div>

        <footer style={{ backgroundColor: "#1a1a2e", color: "white", padding: 50, textAlign: "center" }}>
          <h2 style={{ color: "#f0a500", marginBottom: 20 }}>SearcHome</h2>
          <p style={{ color: "#ccc", marginBottom: 20 }}>Plateforme de gestion de logements</p>
          <div style={{ marginBottom: 20 }}>
            <a href="#accueil" style={{ color: "#ccc", marginRight: 20, textDecoration: "none" }}>Accueil</a>
            <a href="#proprietes" style={{ color: "#ccc", marginRight: 20, textDecoration: "none" }}>Propriétés</a>
            <a href="#apropos" style={{ color: "#ccc", marginRight: 20, textDecoration: "none" }}>À propos</a>
            <a href="#contact" style={{ color: "#ccc", textDecoration: "none" }}>Contact</a>
          </div>
          <p style={{ color: "#666", fontSize: 14 }}>&copy; 2026 SearcHome- Tous droits réservés</p>
        </footer>
      </div>
    </PageLayout>
  );
}

export default LandingPage;
