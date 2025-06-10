import React from "react";
import { Link } from "react-router-dom";
import '../styles/games.css'

const Game = () => {
    return(
        
        <section className="juegos-links">
            <ol>
                <li>
                    <Link to="/primer-juego">
                        Primer juego
                    </Link>
                </li>
                {/* Puedes agregar más juegos aquí */}
                <li>
                    <Link to="/otro-juego">
                        Segundo juego
                    </Link>
                </li>
              
            </ol>
        </section>
    );

};

export default Game