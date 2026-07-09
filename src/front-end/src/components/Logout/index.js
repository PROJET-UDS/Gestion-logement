import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import { clearAuthSession } from "services/authService";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/authentification/sign-in");
  };

  return (
    <MDButton
      variant="gradient"
      color="error"
      fullWidth
      onClick={handleLogout}
      style={{ marginTop: "20px" }}
    >
      <Icon>logout</Icon>&nbsp; Se déconnecter
    </MDButton>
  );
}

export default Logout;
