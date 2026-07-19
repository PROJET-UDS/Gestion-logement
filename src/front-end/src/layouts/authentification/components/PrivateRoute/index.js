import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "services/authService";

function PrivateRoute({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/authentification/sign-in" state={{ from: location }} replace />;
  }
  return children;
}

export default PrivateRoute;
