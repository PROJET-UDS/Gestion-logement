import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import UserDetail from "layouts/userdetail";
import Logements from "layouts/logements";
import LogementDetail from "layouts/logementdetail";
import AjouterLogement from "layouts/logements/ajouter";
import ModifierLogement from "layouts/logements/modifier";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentification/sign-in";
import SignUp from "layouts/authentification/sign-up";
import ResetPassword from "layouts/authentification/reset-password";
import LandingPage from "components/LandingPage";

import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Logements",
    key: "logements",
    icon: <Icon fontSize="small">home_work</Icon>,
    route: "/logements",
    component: <Logements />,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentification/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentification/sign-up",
    component: <SignUp />,
  },
  {
    type: "collapse",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">lock_reset</Icon>,
    route: "/authentification/reset-password",
    component: <ResetPassword />,
  },
  {
    route: "/tables/:id",
    key: "user-detail",
    component: <UserDetail />,
  },
  {
    route: "/logements/ajouter",
    key: "logement-ajouter",
    component: <AjouterLogement />,
  },
  {
    route: "/logements/:id/modifier",
    key: "logement-modifier",
    component: <ModifierLogement />,
  },
  {
    route: "/logements/:id",
    key: "logement-detail",
    component: <LogementDetail />,
  },
  {
    type: "collapse",
    name: "Accueil",
    key: "landing",
    route: "/",
    component: <LandingPage />,
  },
];

export default routes;