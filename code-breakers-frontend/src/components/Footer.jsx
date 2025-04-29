import React from "react";
import "../styles/footer.css";


const Footer = () => {
    return(
        <footer className="footer-container">
            <p>&copy; {new Date().getFullYear()} Mi Aplicación. Todos los derechos reservados.</p>
        </footer>
    );
};

export default Footer