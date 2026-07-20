import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Container from "@mui/material/Container";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer({ light = false }) {
  const textColor = light ? "white" : "text";

  return (
    <MDBox position="absolute" width="100%" bottom={0} py={{ xs: 2, md: 3 }}>
      <Container>
        <MDBox
          width="100%"
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          px={1.5}
        >
          <MDTypography
            variant="caption"
            color={textColor}
            sx={{ opacity: light ? 0.72 : 1 }}
          >
            © {new Date().getFullYear()} SearchHome · Tous droits réservés
          </MDTypography>
          <MDBox display="flex" alignItems="center" gap={2.5}>
            <MDTypography
              component={Link}
              to="/"
              variant="caption"
              color={textColor}
              fontWeight="medium"
              sx={{ opacity: light ? 0.82 : 1 }}
            >
              Accueil
            </MDTypography>
            <MDTypography
              component={Link}
              to="/annonces"
              variant="caption"
              color={textColor}
              fontWeight="medium"
              sx={{ opacity: light ? 0.82 : 1 }}
            >
              Annonces
            </MDTypography>
          </MDBox>
        </MDBox>
      </Container>
    </MDBox>
  );
}

Footer.propTypes = {
  light: PropTypes.bool,
};

export default Footer;
