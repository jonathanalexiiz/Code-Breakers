import React from "react";
import { Link } from "react-router-dom";

const Game = () => {
    return(
        
        <section className="juegos-links">
            <ol>
                <li>
                    <Link to="/esqueleto-portada">
                        Conociendo las partes del Esqueleto
                    </Link>
                </li>
                {/* Puedes agregar más juegos aquí */}
                <li>
                    <Link to="/otro-juego">
                        Otro juego educativo
                    </Link>
                </li>
            </ol>
        </section>
    );

};

export default Game