import React from "react";
import { Link } from "react-router-dom";
import '../styles/games.css'

import ImagenJuego1 from "../images/lasaña.jpeg"
import ImagenJuego2 from "../images/2.jpg"
import ImagenCrearJuego from "../images/3.jpg"

const Game = ({userRole}) => {
    return(
        <section className="games-container">
            {/* <h1>Juegos Interactivos</h1> */}
            <div className="games-grid">
                {/* Botón 1 - Corregido: agregadas las llaves {} */}
                <Link to="/primer-juego" className="game-button">
                <img src="ImagenJuego1" alt="Primer juego" />
                <span>Primer juego</span>
                </Link> 

                <Link to="/actividades" className="game-button">
                <img src={ImagenJuego2} alt="Segundo juego" />
                <span>Actividades</span>
                </Link>

                {/* Botón 3 - SOLO para docentes */}
                {userRole === "docente" && (
                    <Link to="/crear-juego" className="game-button">
                        <img src={ImagenCrearJuego} alt="Crear juego" />
                        <span>Crear juego</span>
                    </Link>
                )}
            </div>
        </section>
    );
};

export default Game;