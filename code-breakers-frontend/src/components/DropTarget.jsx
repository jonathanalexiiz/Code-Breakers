import React from "react";
import "../styles/DropTarget.css"; // Asegúrate de tener estilos opcionales

const DropTarget = ({ isActive, itemDropped, onDropItem, posicion }) => {
  // Permitir soltar elementos
  const handleDrop = (e) => {
    e.preventDefault();
    onDropItem(); // Llama a la función del padre
  };

  // Permitir el arrastre encima de este contenedor
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className={`drop-target ${isActive ? "activo" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="paso-numero">
        <strong>Paso {posicion}:</strong>
      </div>
      <div className="contenido-drop">
        {itemDropped ? (
          <span>{itemDropped}</span>
        ) : (
          <span className="placeholder">Arrastra aquí</span>
        )}
      </div>
    </div>
  );
};

export default DropTarget;
