import React from "react";
import "../styles/dropTarget.css";

const DropTarget = ({ onDropItem, isActive, itemDropped }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedItem = e.dataTransfer.getData("text/plain");
    onDropItem(droppedItem);
  };

  return (
    <div 
      className={`drop-target ${isActive ? "active" : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {itemDropped ? (
        <strong>{itemDropped}</strong>
      ) : (
        isActive ? "Suelta aquí" : "Suelta aquí el paso #4"
      )}
    </div>
  );
};

export default DropTarget;
