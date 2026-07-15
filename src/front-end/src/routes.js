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

import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import TableViewIcon from "@mui/icons-material/TableView";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FormatTextdirectionRToLIcon from "@mui/icons-material/FormatTextdirectionRToL";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LockResetIcon from "@mui/icons-material/LockReset";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <DashboardIcon fontSize="small" />,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Logements",
    key: "logements",
    icon: <HomeWorkIcon fontSize="small" />,
    route: "/logements",
    component: <Logements />,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <TableViewIcon fontSize="small" />,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <ReceiptLongIcon fontSize="small" />,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <FormatTextdirectionRToLIcon fontSize="small" />,
    route: "/rtl",
    component: <RTL />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <NotificationsIcon fontSize="small" />,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <PersonIcon fontSize="small" />,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <LoginIcon fontSize="small" />,
    route: "/authentification/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <AssignmentIcon fontSize="small" />,
    route: "/authentification/sign-up",
    component: <SignUp />,
  },
  {
    type: "collapse",
    name: "Reset Password",
    key: "reset-password",
    icon: <LockResetIcon fontSize="small" />,
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