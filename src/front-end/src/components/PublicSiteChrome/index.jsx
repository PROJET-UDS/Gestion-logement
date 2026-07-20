import { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { getUserRole, isAuthenticated, logout } from "services/authService";

import "./styles.css";

const ROLE_LABELS = {
  ADMIN: "Administrateur",
  PROPRIETAIRE: "Propriétaire",
  CLIENT: "Client",
};

const PUBLIC_LINKS = [
  { label: "Accueil", to: "/", key: "home" },
  { label: "Annonces", to: "/annonces", key: "annonces" },
  { label: "À propos", to: "/#apropos", key: "about" },
  { label: "Contact", to: "/#contact", key: "contact" },
];

function PublicHeader({ active = "" }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());
  const role = getUserRole();

  const closeMenus = () => {
    setAnchorEl(null);
    setMobileMenuOpen(false);
  };

  const goTo = (path) => {
    closeMenus();
    navigate(path);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    setAuthenticated(false);
    navigate("/", { replace: true });
  };

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link
          className="public-brand"
          to="/"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="public-brand__mark" aria-hidden="true">
            <Icon>roofing</Icon>
          </span>
          <span>
            Search<span>Home</span>
          </span>
        </Link>

        <button
          type="button"
          className="public-header__toggle"
          onClick={() => setMobileMenuOpen((current) => !current)}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
        >
          <Icon>{mobileMenuOpen ? "close" : "menu"}</Icon>
        </button>

        <nav
          className={`public-header__nav${
            mobileMenuOpen ? " public-header__nav--open" : ""
          }`}
          aria-label="Navigation principale"
        >
          <div className="public-header__links">
            {PUBLIC_LINKS.map((link) =>
              link.to.includes("#") ? (
                <a
                  key={link.key}
                  href={link.to}
                  className={active === link.key ? "is-active" : ""}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.key}
                  to={link.to}
                  className={active === link.key ? "is-active" : ""}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {authenticated ? (
            <div className="public-header__account">
              <button
                type="button"
                className="public-account-button"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchorEl)}
              >
                <Avatar className="public-account-button__avatar">
                  {role?.charAt(0) || "U"}
                </Avatar>
                <span>
                  <strong>Mon espace</strong>
                  <small>{ROLE_LABELS[role] || "Utilisateur"}</small>
                </span>
                <Icon>expand_more</Icon>
              </button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{ sx: { minWidth: 220, mt: 1, borderRadius: 2 } }}
              >
                <MenuItem onClick={() => goTo("/dashboard")}>
                  <ListItemIcon>
                    <Icon fontSize="small">dashboard</Icon>
                  </ListItemIcon>
                  Tableau de bord
                </MenuItem>
                {role === "PROPRIETAIRE" && (
                  <MenuItem onClick={() => goTo("/mes-logements")}>
                    <ListItemIcon>
                      <Icon fontSize="small">home_work</Icon>
                    </ListItemIcon>
                    Mes logements
                  </MenuItem>
                )}
                {role === "PROPRIETAIRE" && (
                  <MenuItem onClick={() => goTo("/proprietaire/reservations")}>
                    <ListItemIcon>
                      <Icon fontSize="small">event_note</Icon>
                    </ListItemIcon>
                    Réservations reçues
                  </MenuItem>
                )}
                {role === "CLIENT" && (
                  <MenuItem onClick={() => goTo("/mes-reservations")}>
                    <ListItemIcon>
                      <Icon fontSize="small">book_online</Icon>
                    </ListItemIcon>
                    Mes réservations
                  </MenuItem>
                )}
                {role === "ADMIN" && (
                  <MenuItem onClick={() => goTo("/admin/validation")}>
                    <ListItemIcon>
                      <Icon fontSize="small">verified</Icon>
                    </ListItemIcon>
                    Validations
                  </MenuItem>
                )}
                <MenuItem onClick={() => goTo("/billing")}>
                  <ListItemIcon>
                    <Icon fontSize="small">receipt_long</Icon>
                  </ListItemIcon>
                  Paiements
                </MenuItem>
                <MenuItem onClick={() => goTo("/profile")}>
                  <ListItemIcon>
                    <Icon fontSize="small">person</Icon>
                  </ListItemIcon>
                  Profil
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Icon fontSize="small">logout</Icon>
                  </ListItemIcon>
                  Déconnexion
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <div className="public-header__auth">
              <Link
                to="/authentification/sign-in"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                className="public-button public-button--accent public-button--small"
                to="/authentification/sign-up"
                onClick={() => setMobileMenuOpen(false)}
              >
                Créer un compte
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div>
          <Link className="public-brand public-brand--footer" to="/">
            <span className="public-brand__mark" aria-hidden="true">
              <Icon>roofing</Icon>
            </span>
            <span>
              Search<span>Home</span>
            </span>
          </Link>
          <p>La recherche et la gestion de logements, simplement.</p>
        </div>
        <div
          className="public-footer__links"
          aria-label="Liens du pied de page"
        >
          <Link to="/">Accueil</Link>
          <Link to="/annonces">Annonces</Link>
          <a href="/#apropos">À propos</a>
          <a href="/#contact">Contact</a>
        </div>
      </div>
      <div className="public-footer__legal">
        <span>© {new Date().getFullYear()} SearchHome</span>
        <span>Tous droits réservés</span>
      </div>
    </footer>
  );
}

PublicHeader.propTypes = {
  active: PropTypes.oneOf(["", "home", "annonces", "about", "contact"]),
};

export { PublicHeader, PublicFooter };
