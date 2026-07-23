import { Link } from "react-router-dom";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer() {
  return (
    <MDBox
      width="100%"
      py={2}
      px={1.5}
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems="center"
      gap={1}
    >
      <MDTypography variant="caption" color="text">
        © {new Date().getFullYear()} SearchHome · Tous droits réservés
      </MDTypography>
      <MDBox display="flex" alignItems="center" gap={2.5}>
        <MDTypography
          component={Link}
          to="/"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          Accueil
        </MDTypography>
        <MDTypography
          component={Link}
          to="/annonces"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          Annonces
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

export default Footer;
