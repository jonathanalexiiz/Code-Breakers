import React from "react";
import "../styles/draggableItem.css";

const DraggableItem = ({ name, isUsed, onDragStart, onDragEnd }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", name);
    onDragStart(name);
  };

  return (
    <div 
      draggable={!isUsed}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`draggable-item ${isUsed ? 'used' : ''}`}
    >
      {name}
    </div>
  );
};

export default DraggableItem;
