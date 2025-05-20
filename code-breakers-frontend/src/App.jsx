import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Game from "./pages/Games";
import PortadaJuego from "./pages/PortadaJuego";
import PrimerJuego from "./pages/PrimerJuego";
import OtroJuegoPortada from "./pages/OtroJuegoPortada";
import CrearJuego from "./pages/crearJuego";

import Layout from "./components/Layout";
import Login from "./components/Login";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>

        {/* Ruta login sin Layout, se pasa onLogin */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />

        {/* Rutas protegidas con Layout */}
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route path="home" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="games" element={<Game />} />
            <Route path="portada-juego" element={<PortadaJuego />} />
            <Route path="otro-juego" element={<OtroJuegoPortada />} />
            <Route path="primer-juego" element={<PrimerJuego />} />
            <Route path="crear-juego" element={<CrearJuego />} />
          </Route>
        ) : (
          // Si no está autenticado, redirige cualquier ruta protegida al login
          <Route path="*" element={<Navigate to="/" />} />
        )}

      </Routes>
    </Router>
  );
};

export default App;
