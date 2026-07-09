import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { getDefaultRouteForRole, getUserRole, isAuthenticated } from "services/authService";

function PrivateRoute({ children, roles }) {
  const location = useLocation();
  const role = getUserRole();

  if (!isAuthenticated()) {
    return <Navigate to="/authentification/sign-in" state={{ from: location }} replace />;
  }

  if (roles.length && !roles.includes(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

PrivateRoute.defaultProps = {
  roles: [],
};

export default PrivateRoute;
