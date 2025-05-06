import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/esqueletoPortada.css";

const PortadaJuego = () => {
  const navigate = useNavigate();

  return (
    <section className="portada-contenedor">
      <div className="contenedor-boton">
         <button 
            className="boton-jugar"
            onClick={() => navigate("/primer-juego")}
          >
            JUGAR
          </button>

      </div>
    </section>
  );
};

export default PortadaJuego;
