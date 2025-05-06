import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Layout from "./components/Layout";
import Game from "./pages/Games";
import PortadaJuego from "./pages/PortadaJuego";
import PrimerJuego from "./pages/PrimerJuego";
import OtroJuegoPortada from "./pages/OtroJuegoPortada";
import CrearJuego from "./pages/crearJuego";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>

          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="games" element= {< Game />} />
          <Route path="portada-juego" element={<PortadaJuego/>} />
          <Route path="otro-juego" element={<OtroJuegoPortada/>} />
          <Route path="primer-juego" element={<PrimerJuego/>} />
          <Route path="crear-juego" element={<CrearJuego />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
