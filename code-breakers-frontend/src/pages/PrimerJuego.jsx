import React, { useState } from "react";
import "../styles/primerJuego.css";
import DraggableItem from "../components/DraggableItem";
import DropTarget from "../components/DropTarget";

const PrimerJuego = () => {
  const palabras = [
    "Usar apps de control remoto sin verificación",
    "Activar acceso desde otros paises",
    "Compartir acceso remoto en línea",
    "Configurar acceso remoto con contraseña débil",
    "Dar acceso remoto a cualquier usuario",
    "Desactivar el acceso remoto innecesario", // ✅ Correcta
    "Habilitar acceso remoto todo el tiempo"
  ];

  const opcionCorrecta = "Desactivar el acceso remoto innecesario";

  const [currentDrag, setCurrentDrag] = useState(null);
  const [usados, setUsados] = useState([]);
  const [pasoActual, setPasoActual] = useState(null);
  const [error, setError] = useState("");

  return (
    <section className="juego-contenedor">
      <div className="tit-bot-contenedor">
        <div className="titulo-contenedor">
          Arrastra los pasos para proteger una red doméstica
        </div>
        <div className="botones-contenedor">
          <button>Salir</button>
          <button>Siguiente</button>
        </div>
      </div>

      <div className="enunciado-imagen-contenedor">
        <div className="imagen-contenedor">
          <img src="./imagenJuego.webp" alt="imagen de juego" />
        </div>
        <div className="enunciado-contenedor">
          Paso 1: arrastra el paso correcto a continuación
        </div>
      </div>

      <div className="arr-opc-contenedor">
        <div className="arrastre-contenedor">
          <DropTarget 
            isActive={!!currentDrag}
            itemDropped={pasoActual}
            onDropItem={(item) => {
              if (item === opcionCorrecta && !usados.includes(item)) {
                setUsados([...usados, item]);
                setPasoActual(item);
                setError("");
              } else {
                setError("❌ Paso incorrecto");
              }
              setCurrentDrag(null);
            }}
          />
          <div className="mensaje-error">{error}</div>
        </div>

        <div className="opciones-contenedor">
          {palabras.map((palabra, index) => (
            <DraggableItem
              key={index}
              name={palabra}
              isUsed={usados.includes(palabra)}
              onDragStart={setCurrentDrag}
              onDragEnd={() => setCurrentDrag(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrimerJuego;
