import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Game from "./pages/Games";
import PrimerJuego from "./pages/PrimerJuego";
import CrearJuego from "./pages/crearJuego";
import VistaPrevia from "./pages/VistaPrevia";
import PortadaJuego from "./pages/PortadaJuego";
import OtroJuegoPortada from "./pages/OtroJuegoPortada";

import Layout from "./components/Layout";
import Login from "./components/Login";
import LayoutDocente from "./components/LayoutDocente";
import LayoutEstudiante from "./components/LayoutEstudiante";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // "docente" o "estudiante"

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const handleLogin = (userData) => {
    console.log("Usuario autenticado:", userData);
    setIsAuthenticated(true);
    setUserRole(userData.role);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("token", userData.token || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // ✅ Layout dinámico según el rol
  const LayoutPrivado = () => {
    if (userRole === "docente") {
      return <LayoutDocente onLogout={handleLogout} />;
    } else if (userRole === "estudiante") {
      return <LayoutEstudiante onLogout={handleLogout} />;
    } else {
      return <Navigate to="/" />;
    }
  };

  return (
    <>

      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          {isAuthenticated ? (
            <Route path="/" element={<LayoutPrivado />}>
              <Route path="home" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="games" element={<Game />} />
              <Route path="portada-juego" element={<PortadaJuego />} />
              <Route path="otro-juego" element={<OtroJuegoPortada />} />
              <Route path="primer-juego" element={<PrimerJuego />} />

              <Route path="vista-previa" element={<VistaPrevia />} />
              <Route path="vista-previa/:id" element={<VistaPrevia />} />

              {userRole === "docente" && (
                <>
                  <Route path="crear-juego" element={<CrearJuego />} />
                  <Route path="crear-juego/:id" element={<CrearJuego />} />
                </>
              )}
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
      </Router>
    </>
  );
};

export default App;
