import React, { useState } from "react";
import DraggableItem from "../components/DraggableItem";
import DropTarget from "../components/DropTarget";
import "../styles/esqueletoJuegoReal.css";

const EsqueletoJuego = () => {
  const palabras = ["CRÁNEO", "COSTILLAS", "FÉMUR", "TIBIA"];
  
  // Definir las zonas con posiciones que coincidan con la imagen
  const zonas = [
    { id: 'zona-1', top: 50, left: -30, correctAnswer: "CRÁNEO" },
    { id: 'zona-2', top: 220, left: 100, correctAnswer: "COSTILLAS" },
    { id: 'zona-3', top: 300, left: 0, correctAnswer: "FÉMUR" },
    { id: 'zona-4', top: 360, left: 200, correctAnswer: "TIBIA" }
  ];
  
  const [palabrasColocadas, setPalabrasColocadas] = useState({
    'zona-1': null,
    'zona-2': null,
    'zona-3': null,
    'zona-4': null
  });
  
  const [feedback, setFeedback] = useState({});
  const [currentDrag, setCurrentDrag] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);
  
  const handleDrop = (zonaId, palabra) => {
    
    setPalabrasColocadas(prev => ({
      ...prev,
      [zonaId]: palabra
    }));
    
    // Verificar si la respuesta es correcta
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
      setFeedback(prev => ({
        ...prev,
        [zonaId]: zona.correctAnswer === palabra ? 'correct' : 'incorrect'
      }));
    }
  };
  
  const resetGame = () => {
    setPalabrasColocadas({
      'zona-1': null,
      'zona-2': null,
      'zona-3': null,
      'zona-4': null
    });
    setFeedback({});
  };
  
  const checkAllCorrect = () => {
    return zonas.every(zona => 
      palabrasColocadas[zona.id] === zona.correctAnswer
    );
  };
  
  // Palabras disponibles (las que no han sido colocadas)
  const palabrasUsadas = Object.values(palabrasColocadas).filter(Boolean);
  
  return (
    <div className="esqueleto-juego-container">
      <h2 className="juego-titulo">
        Juego de Etiquetado del Esqueleto
      </h2>
      
      <div className="juego-content">
        {/* Imagen y zonas de destino */}
        <div className="imagen-esqueleto">
          {zonas.map(zona => (
            <DropTarget
              key={zona.id}
              id={zona.id}
              position={zona}
              currentWord={palabrasColocadas[zona.id]}
              onDrop={handleDrop}
              isOver={dragOverZone}
              setIsOver={setDragOverZone}
            />
          ))}
        </div>
        
        {/* Controles */}
        <div className="controles">
          <button
            onClick={resetGame}
            className="reset-button"
          >
            Reiniciar
          </button>
          
          {checkAllCorrect() && (
            <div className="success-message">
              ¡Todas las respuestas son correctas!
            </div>
          )}
        </div>
        
        {/* Palabras disponibles */}
        <div className="palabras-container">
          {palabras.map((palabra, index) => (
            <DraggableItem 
              key={index} 
              name={palabra} 
              isUsed={palabrasUsadas.includes(palabra)}
              onDragStart={setCurrentDrag}
              onDragEnd={() => setCurrentDrag(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EsqueletoJuego;