import React from "react";
import { Link } from "react-router-dom";
import '../styles/games.css'

import ImagenJuego1 from "../images/lasaña.jpeg"
import ImagenJuego2 from "../images/2.jpg"
import ImagenCrearJuego from "../images/3.jpg"
const Game = ({userRole}) => {
    return(
        
        <section className="games-container">
            <h1>Juegos Interactivos</h1>
            <div className="games-grid">
                {/*Boton 1*/}
                <Link to="/primer-juego" className="game-button">
                <img src="ImagenJuego1" alt="Primer juego" />
                <span>Primer juego</span>
                </Link>
                {/* Botón 2 */}
                <Link to="/otro-juego" className="game-button">
                    <img src={ImagenJuego2} alt="Segundo juego" />
                    <span>Segundo juego</span>
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
       /* <section className="juegos-links">
            <ol>
                <li>
                    <Link to="/primer-juego">
                        Primer juego
                    </Link>
                </li>
                { /* Puedes agregar más juegos aquí }*/
        /*        <li>
                    <Link to="/otro-juego">
                        Segundo juego
                    </Link>
                </li>
              
            </ol>
        </section> 
        */
    );

};

export default Game
