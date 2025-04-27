import React from "react"
import "../styles/navbar.css"
import { Link } from "react-router-dom";
import "../styles/navbar.css"

const Navbar = () => {
    return(
        <nav className="nav-links">
            <Link to="/">Inicio</Link>
            <Link to="/about">Sobre Nosotros</Link>
            <Link to="/contact">Contacto</Link>
            <Link to= "/games">Juegos</Link>
        </nav>
    );
};
export default Navbar