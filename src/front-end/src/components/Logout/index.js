import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
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