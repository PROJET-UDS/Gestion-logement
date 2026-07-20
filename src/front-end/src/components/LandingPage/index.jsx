import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";

import { PublicFooter, PublicHeader } from "components/PublicSiteChrome";
import PageLayout from "examples/LayoutContainers/PageLayout";
import { getFileUrl, getLogementsPublic } from "api/logementApi";
import { getUserRole, isAuthenticated } from "services/authService";

import "./styles.css";

const CITY_OPTIONS = [
  "Dschang",
  "Yaoundé",
  "Douala",
  "Bafoussam",
  "Bamenda",
  "Garoua",
  "Maroua",
];

const TYPE_LABELS = {
  APPARTEMENT: "Appartement",
  MAISON: "Maison",
  STUDIO: "Studio",
  CHAMBRE: "Chambre",
};

function LandingPage() {
  const navigate = useNavigate();
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchVille, setSearchVille] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchTransaction, setSearchTransaction] = useState("");

  useEffect(() => {
    let active = true;

    getLogementsPublic()
      .then((data) => {
        if (active) {
          setLogements(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError("Les logements ne sont pas disponibles pour le moment.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchVille) params.set("ville", searchVille);
    if (searchType) params.set("typeLogement", searchType);
    if (searchTransaction) params.set("typeTransaction", searchTransaction);
    navigate(`/annonces${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const reservationPath = (logementId) => {
    if (!isAuthenticated()) {
      return `/authentification/sign-up?reserver=${logementId}`;
    }
    return getUserRole() === "CLIENT"
      ? `/annonces/${logementId}?reserver=1`
      : null;
  };

  const accountPath = isAuthenticated()
    ? "/dashboard"
    : "/authentification/sign-up";

  return (
    <PageLayout>
      <div className="landing-page">
        <PublicHeader active="home" />

        <main>
          <section
            className="landing-hero"
            id="accueil"
            style={{ backgroundImage: "url('/images/billboard.jpg')" }}
          >
            <div className="landing-hero__overlay" />
            <div className="landing-container landing-hero__content">
              <div className="landing-hero__copy">
                <span className="landing-eyebrow">
                  <Icon>verified</Icon>
                  Votre logement, en toute confiance
                </span>
                <h1>
                  Trouvez un lieu qui vous <span>ressemble.</span>
                </h1>
                <p>
                  Explorez des logements vérifiés au Cameroun, réservez en
                  quelques étapes et gérez tout depuis un espace unique.
                </p>
                <div className="landing-hero__actions">
                  <a
                    className="public-button public-button--accent"
                    href="#proprietes"
                  >
                    Voir les logements
                    <Icon>arrow_forward</Icon>
                  </a>
                  <Link className="landing-text-link" to={accountPath}>
                    {isAuthenticated()
                      ? "Ouvrir mon espace"
                      : "Je suis propriétaire"}
                  </Link>
                </div>
              </div>

              <form className="landing-search" onSubmit={handleSearch}>
                <div className="landing-search__heading">
                  <div>
                    <span>Recherche rapide</span>
                    <strong>Quel logement cherchez-vous ?</strong>
                  </div>
                  <span className="landing-search__icon" aria-hidden="true">
                    <Icon>search</Icon>
                  </span>
                </div>
                <div className="landing-search__fields">
                  <label>
                    <span>Projet</span>
                    <select
                      value={searchTransaction}
                      onChange={(event) =>
                        setSearchTransaction(event.target.value)
                      }
                    >
                      <option value="">Louer ou acheter</option>
                      <option value="LOCATION">Louer</option>
                      <option value="VENTE">Acheter</option>
                    </select>
                  </label>
                  <label>
                    <span>Localisation</span>
                    <select
                      value={searchVille}
                      onChange={(event) => setSearchVille(event.target.value)}
                    >
                      <option value="">Toutes les villes</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Type de bien</span>
                    <select
                      value={searchType}
                      onChange={(event) => setSearchType(event.target.value)}
                    >
                      <option value="">Tous les types</option>
                      {Object.entries(TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  className="public-button public-button--accent landing-search__submit"
                  type="submit"
                >
                  <Icon>search</Icon>
                  Rechercher
                </button>
              </form>
            </div>

            <div className="landing-container landing-proof">
              <div>
                <Icon>verified_user</Icon>
                <span>
                  <strong>Annonces validées</strong> avant publication
                </span>
              </div>
              <div>
                <Icon>payments</Icon>
                <span>
                  <strong>Paiements suivis</strong> depuis votre espace
                </span>
              </div>
              <div>
                <Icon>support_agent</Icon>
                <span>
                  <strong>Parcours simple</strong> pour chaque profil
                </span>
              </div>
            </div>
          </section>

          <section
            className="landing-section landing-properties"
            id="proprietes"
          >
            <div className="landing-container">
              <div className="landing-section__heading">
                <div>
                  <span className="landing-kicker">Sélection du moment</span>
                  <h2>Des logements prêts à vous accueillir</h2>
                  <p>
                    Découvrez les dernières annonces publiées sur la plateforme.
                  </p>
                </div>
                <Link
                  className="public-button public-button--outline"
                  to="/annonces"
                >
                  Toutes les annonces
                  <Icon>arrow_forward</Icon>
                </Link>
              </div>

              {loading ? (
                <div className="landing-state">
                  <CircularProgress sx={{ color: "#f2a900" }} />
                  <span>Chargement des logements…</span>
                </div>
              ) : loadError ? (
                <div className="landing-state landing-state--error">
                  <Icon>cloud_off</Icon>
                  <strong>Connexion momentanément indisponible</strong>
                  <span>{loadError}</span>
                  <Link
                    className="public-button public-button--small"
                    to="/annonces"
                  >
                    Réessayer sur la page des annonces
                  </Link>
                </div>
              ) : logements.length === 0 ? (
                <div className="landing-state">
                  <Icon>holiday_village</Icon>
                  <strong>Aucun logement disponible</strong>
                  <span>De nouvelles annonces seront bientôt publiées.</span>
                </div>
              ) : (
                <div className="landing-property-grid">
                  {logements.map((logement) => {
                    const reserveTo =
                      logement.typeTransaction === "LOCATION"
                        ? reservationPath(logement.id)
                        : null;

                    return (
                      <article
                        className="landing-property-card"
                        key={logement.id}
                      >
                        <Link
                          className="landing-property-card__media"
                          to={`/annonces/${logement.id}`}
                          aria-label={`Voir ${logement.titre}`}
                        >
                          {logement.medias?.length > 0 ? (
                            <img
                              src={getFileUrl(logement.medias[0].fileUrl)}
                              alt={logement.titre}
                            />
                          ) : (
                            <span className="landing-property-card__placeholder">
                              <Icon>holiday_village</Icon>
                            </span>
                          )}
                          <span className="landing-property-card__type">
                            {TYPE_LABELS[logement.typeLogement] ||
                              logement.typeLogement}
                          </span>
                          <span className="landing-property-card__transaction">
                            {logement.typeTransaction === "VENTE"
                              ? "À vendre"
                              : "À louer"}
                          </span>
                        </Link>
                        <div className="landing-property-card__body">
                          <div className="landing-property-card__location">
                            <Icon>location_on</Icon>
                            {logement.ville}
                            {logement.quartier ? ` · ${logement.quartier}` : ""}
                          </div>
                          <Link to={`/annonces/${logement.id}`}>
                            <h3>{logement.titre}</h3>
                          </Link>
                          <div className="landing-property-card__meta">
                            {logement.nbPieces && (
                              <span>
                                <Icon>meeting_room</Icon>
                                {logement.nbPieces} pièces
                              </span>
                            )}
                            {logement.superficie && (
                              <span>
                                <Icon>square_foot</Icon>
                                {logement.superficie} m²
                              </span>
                            )}
                          </div>
                          <div className="landing-property-card__footer">
                            <div className="landing-property-card__price">
                              <strong>
                                {Number(logement.prix || 0).toLocaleString(
                                  "fr-FR"
                                )}{" "}
                                FCFA
                              </strong>
                              {logement.typeTransaction === "LOCATION" && (
                                <span>par mois</span>
                              )}
                            </div>
                            <div className="landing-property-card__actions">
                              <Link
                                className="landing-icon-button"
                                to={`/annonces/${logement.id}`}
                                aria-label={`Voir les détails de ${logement.titre}`}
                              >
                                <Icon>arrow_outward</Icon>
                              </Link>
                              {reserveTo && (
                                <Link
                                  className="landing-icon-button landing-icon-button--accent"
                                  to={reserveTo}
                                  aria-label={`Réserver ${logement.titre}`}
                                >
                                  <Icon>calendar_month</Icon>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="landing-section landing-about" id="apropos">
            <div className="landing-container landing-about__grid">
              <div className="landing-about__visual">
                <img
                  src="/images/item-large1.jpg"
                  alt="Intérieur d’un logement moderne"
                />
                <div className="landing-about__badge">
                  <Icon>handshake</Icon>
                  <span>
                    <strong>Un parcours transparent</strong> de l’annonce à la
                    réservation
                  </span>
                </div>
              </div>
              <div className="landing-about__copy">
                <span className="landing-kicker">Pourquoi SearchHome ?</span>
                <h2>Une plateforme pensée pour locataires et propriétaires</h2>
                <p>
                  SearchHome centralise les annonces, les demandes de
                  réservation et le suivi des paiements. Chacun dispose d’un
                  espace adapté à ses besoins, sans démarches dispersées.
                </p>
                <div className="landing-feature-list">
                  <div>
                    <span>
                      <Icon>manage_search</Icon>
                    </span>
                    <div>
                      <strong>Recherche précise</strong>
                      <p>
                        Filtrez par ville, type de logement, transaction et
                        budget.
                      </p>
                    </div>
                  </div>
                  <div>
                    <span>
                      <Icon>space_dashboard</Icon>
                    </span>
                    <div>
                      <strong>Gestion centralisée</strong>
                      <p>
                        Retrouvez logements, réservations et paiements dans
                        votre tableau de bord.
                      </p>
                    </div>
                  </div>
                  <div>
                    <span>
                      <Icon>lock</Icon>
                    </span>
                    <div>
                      <strong>Accès selon votre rôle</strong>
                      <p>
                        Chaque utilisateur accède uniquement aux fonctionnalités
                        qui le concernent.
                      </p>
                    </div>
                  </div>
                </div>
                <Link className="public-button" to={accountPath}>
                  {isAuthenticated()
                    ? "Accéder au tableau de bord"
                    : "Créer mon compte"}
                  <Icon>arrow_forward</Icon>
                </Link>
              </div>
            </div>
          </section>

          <section
            className="landing-contact"
            id="contact"
            style={{
              backgroundImage:
                "linear-gradient(105deg, rgba(16, 24, 43, 0.98), rgba(27, 41, 68, 0.9)), url('/images/background.jpg')",
            }}
          >
            <div className="landing-container landing-contact__inner">
              <div>
                <span className="landing-kicker">Un nouveau départ</span>
                <h2>Votre prochain logement est peut-être déjà ici.</h2>
                <p>
                  Parcourez les annonces ou créez votre espace pour profiter de
                  tout le parcours SearchHome.
                </p>
              </div>
              <div className="landing-contact__actions">
                <Link
                  className="public-button public-button--accent"
                  to="/annonces"
                >
                  Explorer les annonces
                </Link>
                <Link className="landing-contact__secondary" to={accountPath}>
                  {isAuthenticated()
                    ? "Mon tableau de bord"
                    : "Créer un compte"}
                  <Icon>arrow_forward</Icon>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <PublicFooter />
      </div>
    </PageLayout>
  );
}

export default LandingPage;
