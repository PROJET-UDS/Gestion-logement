import React from "react";

function LandingPage() {
  return (
    <div>
      {/* Navbar */}
      <nav style={{backgroundColor: "#1a1a2e", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <h1 style={{color: "#f0a500", fontSize: "24px", fontWeight: "bold"}}>RESIDO</h1>
        <div>
          <a href="#" style={{color: "white", marginRight: "20px"}}>Accueil</a>
          <a href="#" style={{color: "white", marginRight: "20px"}}>Propriétés</a>
          <a href="#" style={{color: "white", marginRight: "20px"}}>Contact</a>
          <a href="/authentication/sign-in" style={{backgroundColor: "#f0a500", color: "white", padding: "10px 20px", borderRadius: "25px", textDecoration: "none"}}>Connexion</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{backgroundColor: "#1a1a2e", padding: "100px 50px", textAlign: "left"}}>
        <h2 style={{color: "white", fontSize: "48px", fontWeight: "bold"}}>Trouvez Votre<br/>Logement Idéal</h2>
        <p style={{color: "#ccc", fontSize: "18px", marginTop: "20px"}}>Plateforme de gestion de logements simple et efficace.</p>
        <a href="/authentication/sign-up" style={{backgroundColor: "#f0a500", color: "white", padding: "15px 30px", borderRadius: "25px", textDecoration: "none", marginTop: "30px", display: "inline-block"}}>Commencer</a>
      </div>
    </div>
  );
}

export default LandingPage