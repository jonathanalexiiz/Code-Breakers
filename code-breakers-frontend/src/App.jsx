import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Layout from "./components/Layout";
import Game from "./pages/Games";
import JuegoEsqueleto from "./pages/Esqueleto";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>

          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact/>} />
          <Route path="games" element= {< Game/>} />
          <Route path="juego-esqueleto" element={<JuegoEsqueleto />} />
          
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
