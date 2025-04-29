import React from "react";
import "../styles/dropTarget.css";

const DropTarget = ({ id, currentWord, onDrop, position, isOver, setIsOver }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!currentWord) {
      setIsOver(id);
    }
  };
  
  const handleDragLeave = () => {
    setIsOver(null);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(null);
    
    if (!currentWord) {
      const word = e.dataTransfer.getData("text/plain");
      onDrop(id, word);
    }
  };

  const isHighlighted = isOver === id && !currentWord;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`drop-zone ${isHighlighted ? 'highlight' : ''} ${currentWord ? 'filled' : ''}`}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {currentWord ? (
        <div className="word-content">
          {currentWord}
        </div>
      ) : (
        <div className="placeholder-text">
          Soltar aquí
        </div>
      )}
    </div>
  );
};

export default DropTarget;