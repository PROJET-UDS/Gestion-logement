import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import PrivateRoute from "components/PrivateRoute";
import { getDefaultRouteForRole, getUserRole, isAuthenticated } from "services/authService";

const findRouteByPath = (allRoutes, path) => {
  for (const route of allRoutes) {
    if (route.collapse) {
      const nestedRoute = findRouteByPath(route.collapse, path);
      if (nestedRoute) return nestedRoute;
    }
    if (route.route === path) return route;
  }
  return null;
};

const filterRoutesByRole = (allRoutes, role) =>
  allRoutes
    .map((route) => {
      if (route.collapse) {
        return { ...route, collapse: filterRoutesByRole(route.collapse, role) };
      }
      return route;
    })
    .filter((route) => {
      if (route.hideInSidenav || !route.type) return false;
      if (!route.roles) return true;
      return route.roles.includes(role);
    });

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const role = getUserRole();
  const authenticated = isAuthenticated();
  const sidenavRoutes = filterRoutesByRole(routes, role);
  const currentRoute = findRouteByPath(routes, pathname);
  const showDashboardShell = layout === "dashboard" && authenticated && !currentRoute?.public;


  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        if (route.public) {
          return <Route exact path={route.route} element={route.component} key={route.key} />;
        }
        return (
          <Route
            exact
            path={route.route}
            element={<PrivateRoute roles={route.roles}>{route.component}</PrivateRoute>}
            key={route.key}
          />
        );
      }
      return null;
    });

  const configsButton = <></>;

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={themeRTL}>
        <CssBaseline />
        {showDashboardShell && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Gestion Logement"
              routes={sidenavRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to={authenticated ? getDefaultRouteForRole(role) : "/"} />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showDashboardShell && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Gestion Logement"
            routes={sidenavRoutes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to={authenticated ? getDefaultRouteForRole(role) : "/"} />} />
      </Routes>
    </ThemeProvider>
  );
}
