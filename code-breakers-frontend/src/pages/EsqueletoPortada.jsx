import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/esqueletoPortada.css";

const EsqueletoPortada = () => {
  const navigate = useNavigate();

  return (
    <section className="juego-esqueleto">
      <div className="contenedor-juego">
        <div className="lado-izquierdo">
          <img src="/mitadNE.webp" alt="Niño Esqueleto" className="imagen-nino" />
        </div>
        <div className="lado-derecho">
          <h1 className="titulo">INDICA LAS PARTES <br /> DEL ESQUELETO</h1>
          <p className="instrucciones">DEBES ARRASTRAR <br /> LAS OPCIONES</p>
          <button 
            className="boton-jugar"
            onClick={() => navigate("/esqueleto-juego-real")}
          >
            JUGAR
          </button>
        </div>
      </div>
    </section>
  );
};

export default EsqueletoPortada;
