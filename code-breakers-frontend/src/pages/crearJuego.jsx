import React, { useState } from 'react';
import '../styles/crearJuego.css';

export default function DocenteActividad() {
  const [question, setQuestion] = useState('');
  const [steps, setSteps] = useState(['']);
  const [correctSteps, setCorrectSteps] = useState([]);
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [background, setBackground] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackground(URL.createObjectURL(file));
    }
  };

  const handleDragStart = (item) => {
    setDragItem(item);
    setMessage('');
  };

  const handleDrop = (index) => {
    if (dragItem !== null && index === currentStep) {
      const correctItem = correctSteps[currentStep];
      if (dragItem === correctItem) {
        const newAnswers = [...answers];
        newAnswers[index] = dragItem;
        setAnswers(newAnswers);
        setCurrentStep(currentStep + 1);
        setDragItem(null);

        if (currentStep + 1 === correctSteps.length) {
          setMessage('¡Felicidades, lo lograste!');
        }
      } else {
        setMessage('Ese paso no ocurre en este momento del proceso.');
      }
    } else {
      setMessage('Debes seguir el orden correcto.');
    }
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const startPreview = () => {
    const filtered = steps.filter((s) => s.trim() !== '');
    setCorrectSteps(filtered);
    setAnswers(new Array(filtered.length).fill(null));
    setCurrentStep(0);
    setMessage('');
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
    setIsPreview(true);
  };

  const resetPreview = () => {
    setIsPreview(false);
    setAnswers([]);
    setCurrentStep(0);
    setMessage('');
    setDragItem(null);
  };

  return (
    <div className="actividad-container">
      {!isPreview ? (
        <div className="editor">
          <h2>Crear nueva actividad interactiva</h2>
          <textarea
            placeholder="Escribe la pregunta aquí"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <h4>Pasos esperados en orden correcto:</h4>
          {steps.map((step, idx) => (
            <input
              key={idx}
              placeholder={`Paso ${idx + 1}`}
              value={step}
              onChange={(e) => handleStepChange(idx, e.target.value)}
            />
          ))}
          <button className="add-step" onClick={addStep}>+ Agregar paso</button>
          <div className="editor-buttons">
            <button onClick={startPreview}>Vista previa del juego</button>
          </div>
        </div>
      ) : (
        <div
          className="preview"
          style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}
        >
          <div className="overlay">
            <h2>{question}</h2>
            <div className="interactive-area">
              <div className="drop-zones">
                {answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className={`drop-slot ${idx === currentStep ? 'active-slot' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(idx)}
                  >
                    {answer ? <span>{answer}</span> : <span className="placeholder">Suelta aquí</span>}
                  </div>
                ))}
              </div>
              <div className="draggable-items">
                {shuffledSteps.map((step, idx) => (
                  !answers.includes(step) && (
                    <div
                      key={idx}
                      className="draggable"
                      draggable
                      onDragStart={() => handleDragStart(step)}
                    >
                      {step}
                    </div>
                  )
                ))}
              </div>
            </div>
            {message && <div className="message">{message}</div>}
            <div className="preview-buttons">
              <button onClick={resetPreview}>Volver al editor</button>
              <button>Guardar y salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}