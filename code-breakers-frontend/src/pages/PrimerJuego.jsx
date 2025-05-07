import React, { useState } from "react";
import "../styles/primerJuego.css";
import DraggableItem from "../components/DraggableItem";
import DropTarget from "../components/DropTarget";
import { useNavigate } from "react-router-dom";


const PrimerJuego = () => {

  const navigate = useNavigate();
  const pasosCorrectos = [
    "Preparar la salsa boloñesa",
    "Preparar la salsa bechamel",
    "Preparar las láminas de lasaña",
    "Montar la lasaña",
    "Hornear",
    "Reposar y servir",
  ];

  const [currentDrag, setCurrentDrag] = useState(null);
  const [respuestas, setRespuestas] = useState(Array(pasosCorrectos.length).fill(null));
  const [usados, setUsados] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" }); // tipo: 'error' | 'exito'

  const handleDrop = (index) => {
    if (!currentDrag) return;

    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = currentDrag;
    setRespuestas(nuevasRespuestas);

    if (!usados.includes(currentDrag)) {
      setUsados([...usados, currentDrag]);
    }

    setCurrentDrag(null);
  };

  const verificarOrden = () => {
    const nuevasRespuestas = [...respuestas];
    const nuevosUsados = [...usados];
    let hayError = false;

    for (let i = 0; i < pasosCorrectos.length; i++) {
      if (nuevasRespuestas[i] !== pasosCorrectos[i]) {
        const incorrecto = nuevasRespuestas[i];
        nuevasRespuestas[i] = null;

        const indexUsado = nuevosUsados.indexOf(incorrecto);
        if (indexUsado !== -1) {
          nuevosUsados.splice(indexUsado, 1);
        }
        hayError = true;
      }
    }

    setRespuestas(nuevasRespuestas);
    setUsados(nuevosUsados);

    if (hayError) {
      setMensaje({ texto: "❌ Intentalo de nuevo.", tipo: "error" });
    } else {
      setMensaje({ texto: "🎉 ¡Bien hecho! 🎉", tipo: "exito" });
    }
  };

  return (
    <section className="juego-contenedor">
      <div className="tit-bot-contenedor">
        <div className="titulo-contenedor">
          Ordena correctamente los pasos para preparar una lasaña
        </div>
        <div className="botones-contenedor">
          <button
            className="btn-salir"
            onClick={() => navigate("/games")}
          >
            <img src="/logout.webp" alt="Salir" className="icono-salir" />
          </button>
          <button className = "btn-verificar" onClick={verificarOrden} disabled={mensaje.tipo === "exito"}>
            Verificar orden
          </button>
        </div>
      </div>

      <div className="enunciado-imagen-contenedor">
        <div className="imagen-contenedor">
          <img src="./garfield.webp" alt="imagen de juego" />
        </div>
        <div className="enunciado-contenedor">
          Arrastra cada paso al lugar correspondiente (1 al 6)
        </div>
      </div>

      <div className="arr-opc-contenedor">
  <div className="arrastre-contenedor">
    {pasosCorrectos.map((_, index) => (
      <DropTarget
        key={index}
        isActive={!!currentDrag}
        itemDropped={respuestas[index]}
        onDropItem={() => handleDrop(index)}
        posicion={index + 1}
      />
    ))}
  </div>

  <div className="opciones-contenedor">
    {pasosCorrectos.map((paso, index) => (
      <DraggableItem
        key={index}
        name={paso}
        isUsed={usados.includes(paso)}
        onDragStart={setCurrentDrag}
        onDragEnd={() => setCurrentDrag(null)}
      />
    ))}
  </div>
</div>

{/* ✅ Mensaje fuera del bloque, justo debajo */}
{mensaje.texto && (
  <div className={`mensaje-feedback ${mensaje.tipo}`}>
    {mensaje.texto}
  </div>
)}

    </section>
  );
};

export default PrimerJuego;
