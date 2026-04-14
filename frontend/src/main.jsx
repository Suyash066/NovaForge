import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Routes from "./Routes.jsx";
import { AuthProvider } from "./authContext.jsx";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

const AppLayout = () => {
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/signup"];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Routes />
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  </StrictMode>
);