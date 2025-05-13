import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <button className="hamburger" onClick={toggleMenu}>
                &#9776; {/* Unicode del ícono de hamburguesa */}
            </button>
            <div className={`nav-links ${isOpen ? 'open' : ''}`}>
                <Link to="/" onClick={() => setIsOpen(false)}>Inicio</Link>
                <Link to="/about" onClick={() => setIsOpen(false)}>Sobre Nosotros</Link>
                <Link to="/contact" onClick={() => setIsOpen(false)}>Contacto</Link>
                <Link to="/games" onClick={() => setIsOpen(false)}>Juegos</Link>
            </div>
        </nav>
    );
};

export default Navbar;
