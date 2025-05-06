import React from "react";
import { Link } from "react-router-dom";

const Game = () => {
    return(
        
        <section className="juegos-links">
            <ol>
                <li>
                    <Link to="/portada-juego">
                        Juego interactivo
                    </Link>
                </li>
                {/* Puedes agregar más juegos aquí */}
                <li>
                    <Link to="/otro-juego">
                        Otro juego educativo
                    </Link>
                </li>
                <li>
                    <Link to="/crear-juego">
                        Crear Juego
                    </Link>
                </li>
            </ol>
        </section>
    );

};

export default Game