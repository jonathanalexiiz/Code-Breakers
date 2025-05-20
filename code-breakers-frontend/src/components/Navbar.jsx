import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
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
        &#9776;
      </button>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <Link to="/home" onClick={closeMenu}>Inicio</Link>
        <Link to="/about" onClick={closeMenu}>Sobre Nosotros</Link>
        <Link to="/contact" onClick={closeMenu}>Contacto</Link>
        <Link to="/games" onClick={closeMenu}>Juegos</Link>
      </div>
    </nav>
  );
};

export default Navbar;
