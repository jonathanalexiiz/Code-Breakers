import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Layout from "./components/Layout";
import Game from "./pages/Games";
import EsqueletoPortada from "./pages/EsqueletoPortada";
import EsqueletoJuegoReal from "./pages/EsqueletoJuego";
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
          <Route path="esqueleto-portada" element={<EsqueletoPortada />} />
          <Route path="otro-juego" element={<OtroJuegoPortada/>} />
          <Route path="esqueleto-juego-real" element={<EsqueletoJuegoReal/>} />
          <Route path="crear-juego" element={<CrearJuego />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
