import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import UserDetail from "layouts/userdetail";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentification/sign-in";
import SignUp from "layouts/authentification/sign-up";
import ResetPassword from "layouts/authentification/reset-password";
import LandingPage from "components/LandingPage";
import { AjouterLogement, MesLogements, LogementDetail } from "layouts/logements";
import { SiteAnnonces, SiteLogementDetail } from "layouts/site";
import { AUTHENTICATED_ROLES } from "services/authService";

import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    roles: AUTHENTICATED_ROLES,
  },
  {
    type: "collapse",
    name: "Mes Logements",
    key: "mes-logements",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/mes-logements",
    component: <MesLogements />,
    roles: ["PROPRIETAIRE"],
  },
  {
    type: "collapse",
    name: "Utilisateurs",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
    roles: ["ADMIN"],
  },
  {
    type: "collapse",
    name: "payments",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
    roles: ["CLIENT", "PROPRIETAIRE", "ADMIN"],
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
    roles: ["ADMIN"],
    hideInSidenav: true,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
    roles: AUTHENTICATED_ROLES,
  },
  {
    type: "collapse",
    name: "Profil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    roles: AUTHENTICATED_ROLES,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentification/sign-in",
    component: <SignIn />,
    public: true,
    hideInSidenav: true,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentification/sign-up",
    component: <SignUp />,
    public: true,
    hideInSidenav: true,
  },
  {
    type: "collapse",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">lock_reset</Icon>,
    route: "/authentification/reset-password",
    component: <ResetPassword />,
    public: true,
    hideInSidenav: true,
  },
  {
    route: "/tables/:id",
    key: "user-detail",
    component: <UserDetail />,
  },
  {
    route: "/ajouter-logement",
    key: "ajouter-logement",
    component: <AjouterLogement />,
    roles: ["PROPRIETAIRE"],
    hideInSidenav: true,
  },
  {
    route: "/logements/:id",
    key: "logement-detail",
    component: <LogementDetail />,
    roles: AUTHENTICATED_ROLES,
    hideInSidenav: true,
  },
  {
    route: "/annonces",
    key: "annonces",
    component: <SiteAnnonces />,
    public: true,
    hideInSidenav: true,
  },
  {
    route: "/annonces/:id",
    key: "annonce-detail",
    component: <SiteLogementDetail />,
    public: true,
    hideInSidenav: true,
  },
  {
    type: "collapse",
    name: "Accueil",
    key: "landing",
    route: "/",
    component: <LandingPage />,
    public: true,
    hideInSidenav: true,
  },
];

export default routes;
