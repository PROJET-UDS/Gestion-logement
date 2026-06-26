
import React from "react";

function LandingPage() {
  return (
    <div style={{fontFamily: "sans-serif", margin: 0, padding: 0}}>
      
      {/* Navbar */}
      <nav style={{backgroundColor: "#1a1a2e", padding: "20px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", width: "100%", top: 0, zIndex: 1000}}>
        <h1 style={{color: "#f0a500", fontSize: "24px", fontWeight: "bold", margin: 0}}>RESIDO</h1>
        <div>
          <a href="#accueil" style={{color: "white", marginRight: "20px", textDecoration: "none"}}>Accueil</a>
          <a href="#proprietes" style={{color: "white", marginRight: "20px", textDecoration: "none"}}>Propriétés</a>
          <a href="#apropos" style={{color: "white", marginRight: "20px", textDecoration: "none"}}>À propos</a>
          <a href="#contact" style={{color: "white", marginRight: "20px", textDecoration: "none"}}>Contact</a>
          <a href="/authentication/sign-in" style={{backgroundColor: "#f0a500", color: "white", padding: "10px 20px", borderRadius: "25px", textDecoration: "none", marginLeft: "10px"}}>Connexion</a>
          <a href="/authentication/sign-up" style={{backgroundColor: "transparent", color: "white", padding: "10px 20px", borderRadius: "25px", textDecoration: "none", border: "1px solid white", marginLeft: "10px"}}>Inscription</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="accueil" style={{backgroundColor: "#1a1a2e", padding: "150px 50px 100px", textAlign: "left", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
        <h2 style={{color: "white", fontSize: "56px", fontWeight: "bold", marginBottom: "20px"}}>Trouvez Votre<br/>Logement Idéal</h2>
        <p style={{color: "#ccc", fontSize: "18px", marginBottom: "40px", maxWidth: "600px"}}>Plateforme de gestion de logements simple et efficace. Trouvez, réservez et gérez vos logements en toute simplicité.</p>
        
        {/* Search Bar */}
        <div style={{backgroundColor: "white", padding: "20px", borderRadius: "10px", display: "flex", gap: "10px", maxWidth: "700px"}}>
          <select style={{padding: "10px", borderRadius: "5px", border: "1px solid #ccc", flex: 1}}>
            <option>Objectif</option>
            <option>Louer</option>
            <option>Acheter</option>
          </select>
          <select style={{padding: "10px", borderRadius: "5px", border: "1px solid #ccc", flex: 1}}>
            <option>Localisation</option>
            <option>Yaoundé</option>
            <option>Douala</option>
          </select>
          <select style={{padding: "10px", borderRadius: "5px", border: "1px solid #ccc", flex: 1}}>
            <option>Type</option>
            <option>Appartement</option>
            <option>Villa</option>
            <option>Studio</option>
          </select>
          <button style={{backgroundColor: "#f0a500", color: "white", padding: "10px 30px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold"}}>Rechercher</button>
        </div>
      </div>

      {/* Properties Section */}
      <div id="proprietes" style={{padding: "80px 50px", backgroundColor: "#f8f9fa"}}>
        <h2 style={{textAlign: "center", fontSize: "36px", marginBottom: "10px"}}>Nos Propriétés</h2>
        <p style={{textAlign: "center", color: "#666", marginBottom: "50px"}}>Découvrez nos logements disponibles</p>
        
        <div style={{display: "flex", gap: "30px", justifyContent: "center", flexWrap: "wrap"}}>
          {[
            {titre: "Appartement Moderne", lieu: "Yaoundé", prix: "150 000 FCFA/mois", type: "Appartement"},
            {titre: "Villa Luxueuse", lieu: "Douala", prix: "300 000 FCFA/mois", type: "Villa"},
            {titre: "Studio Étudiant", lieu: "Yaoundé", prix: "50 000 FCFA/mois", type: "Studio"},
          ].map((logement, index) => (
            <div key={index} style={{backgroundColor: "white", borderRadius: "10px", padding: "20px", width: "300px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)"}}>
              <div style={{backgroundColor: "#1a1a2e", height: "200px", borderRadius: "8px", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <span style={{color: "#f0a500", fontSize: "50px"}}>🏠</span>
              </div>
              <span style={{backgroundColor: "#f0a500", color: "white", padding: "5px 10px", borderRadius: "5px", fontSize: "12px"}}>{logement.type}</span>
              <h3 style={{marginTop: "10px", fontSize: "18px"}}>{logement.titre}</h3>
              <p style={{color: "#666"}}>📍 {logement.lieu}</p>
              <p style={{color: "#f0a500", fontWeight: "bold", fontSize: "18px"}}>{logement.prix}</p>
              <button style={{backgroundColor: "#1a1a2e", color: "white", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", width: "100%", marginTop: "10px"}}>Voir détails</button>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div id="apropos" style={{padding: "80px 50px", backgroundColor: "white", display: "flex", gap: "50px", alignItems: "center", justifyContent: "center"}}>
        <div style={{maxWidth: "500px"}}>
          <h2 style={{fontSize: "36px", marginBottom: "20px"}}>À Propos de Nous</h2>
          <p style={{color: "#666", lineHeight: "1.8", marginBottom: "20px"}}>Nous sommes une plateforme dédiée à la gestion de logements au Cameroun. Notre mission est de simplifier la recherche et la gestion de logements pour les propriétaires et les locataires.</p>
          <p style={{color: "#666", lineHeight: "1.8", marginBottom: "30px"}}>Avec notre système, vous pouvez gérer vos propriétés, suivre les paiements et communiquer facilement avec vos locataires.</p>
          <a href="/authentication/sign-up" style={{backgroundColor: "#f0a500", color: "white", padding: "15px 30px", borderRadius: "25px", textDecoration: "none", fontWeight: "bold"}}>Commencer maintenant</a>
        </div>
        <div style={{backgroundColor: "#1a1a2e", width: "400px", height: "300px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <span style={{fontSize: "100px"}}>🏘️</span>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" style={{padding: "80px 50px", backgroundColor: "#f8f9fa", textAlign: "center"}}>
        <h2 style={{fontSize: "36px", marginBottom: "10px"}}>Contactez-Nous</h2>
        <p style={{color: "#666", marginBottom: "50px"}}>Nous sommes là pour vous aider</p>
        
        <div style={{maxWidth: "600px", margin: "0 auto"}}>
          <input type="text" placeholder="Votre nom" style={{width: "100%", padding: "15px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box"}} />
          <input type="email" placeholder="Votre email" style={{width: "100%", padding: "15px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box"}} />
          <textarea placeholder="Votre message" rows="5" style={{width: "100%", padding: "15px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box"}}></textarea>
          <button style={{backgroundColor: "#f0a500", color: "white", padding: "15px 50px", borderRadius: "25px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "16px"}}>Envoyer</button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{backgroundColor: "#1a1a2e", color: "white", padding: "50px", textAlign: "center"}}>
        <h2 style={{color: "#f0a500", marginBottom: "20px"}}>RESIDO</h2>
        <p style={{color: "#ccc", marginBottom: "20px"}}>Plateforme de gestion de logements</p>
        <div style={{marginBottom: "20px"}}>
          <a href="#accueil" style={{color: "#ccc", marginRight: "20px", textDecoration: "none"}}>Accueil</a>
          <a href="#proprietes" style={{color: "#ccc", marginRight: "20px", textDecoration: "none"}}>Propriétés</a>
          <a href="#apropos" style={{color: "#ccc", marginRight: "20px", textDecoration: "none"}}>À propos</a>
          <a href="#contact" style={{color: "#ccc", textDecoration: "none"}}>Contact</a>
        </div>
        <p style={{color: "#666", fontSize: "14px"}}>© 2026 Resido - Tous droits réservés</p>
      </footer>

    </div>
  );
}

export default LandingPage;