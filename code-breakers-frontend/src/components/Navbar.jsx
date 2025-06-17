import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = ({ tipoUsuario, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <button
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        ☰
      </button>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <Link to="/home" onClick={closeMenu}>Inicio</Link>
        <Link to="/about" onClick={closeMenu}>Acerca de</Link>

        {tipoUsuario === "docente" && (
          <Link to="/crear-juego" onClick={closeMenu}>Crear Juego</Link>
        )}

        {tipoUsuario === "estudiante" && (
          <Link to="/games" onClick={closeMenu}>Juegos</Link>
        )}

        {onLogout && (
          <button
            className="btn-salir"
            onClick={() => {
              onLogout();
              closeMenu();
            }}
          >
            <img src="/logout.webp" alt="Salir" className="icono-salir" />
            <span className="texto-salir">Salir</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
