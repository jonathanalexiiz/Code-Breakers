import React, { useState, useRef } from 'react';
import Editor from './editor';
import VistaPrevia from './VistaPrevia';
import '../styles/crearJuego.css';

export default function CrearJuego() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [steps, setSteps] = useState([]);
  const [images, setImages] = useState([]);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16px');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textDecoration, setTextDecoration] = useState('none');
  const [textAlign, setTextAlign] = useState('left');
  const [containerHeight, setContainerHeight] = useState(300);
  const [previewMode, setPreviewMode] = useState(false);
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const containerRef = useRef(null);

  const limits = {
    facil: 3,
    intermedio: 5,
    dificil: 7
  };

  // Validar que el paso no esté vacío antes de cambiar
  const handleStepChange = (index, value) => {
    if (value.trim() === '') {
      setMessage('El paso no puede estar vacío.');
      return;
    }
    setMessage('');
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };

  const deleteStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    setMessage('');
  };

  const addStep = () => {
    if (!difficulty) {
      setMessage('Selecciona una dificultad antes de agregar pasos.');
      return;
    }
    if (steps.length >= limits[difficulty]) {
      setMessage('Has alcanzado el número máximo de pasos.');
      return;
    }
    setSteps([...steps, '']);
    setMessage('');
  };

  const updateImagePosition = (id, x, y) => {
    setImages((prev) => prev.map(img => img.id === id ? { ...img, x, y } : img));
  };

  const updateImageSize = (id, width, height) => {
    setImages((prev) => prev.map(img => img.id === id ? { ...img, width: Math.max(20, width), height: Math.max(20, height) } : img));
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter(img => img.id !== id));
  };

  const startPreview = () => {
    if (!title.trim()) {
      setMessage('Por favor, ingresa un título.');
      return;
    }
    if (!description.trim()) {
      setMessage('Por favor, ingresa una descripción.');
      return;
    }
    if (!question.trim()) {
      setMessage('Por favor, ingresa la pregunta.');
      return;
    }
    if (!ageGroup) {
      setMessage('Selecciona un rango de edad.');
      return;
    }
    if (!difficulty) {
      setMessage('Selecciona una dificultad.');
      return;
    }
    if (steps.length === 0 || steps.some(step => step.trim() === '')) {
      setMessage('Todos los pasos deben estar completos.');
      return;
    }

    const shuffled = [...steps].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
    setUserAnswers(Array(steps.length).fill(''));
    setPreviewMode(true);
    setGameCompleted(false);
    setShowFeedback(false);
    setMessage('');
  };

  const resetPreview = () => {
    setPreviewMode(false);
    setMessage('');
  };

  const handleDragStart = (e, step) => {
    e.dataTransfer.setData('text/plain', step);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const step = e.dataTransfer.getData('text/plain');
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = step;
    setUserAnswers(updatedAnswers);
  };

  const saveSteps = () => {
    setGameCompleted(true);
    setShowFeedback(true);
    const correct = steps;
    let feedbackText = '';
    userAnswers.forEach((ans, i) => {
      // Comparar ignorando mayúsculas/minúsculas y espacios extra
      const answerNormalized = ans.trim().toLowerCase();
      const correctNormalized = correct[i].trim().toLowerCase();
      feedbackText += `Paso ${i + 1}: ${answerNormalized === correctNormalized ? '✅ Correcto' : `❌ Incorrecto (Correcto: ${correct[i]})`}\n`;
    });
    setFeedback(feedbackText);
  };

  const resetGame = () => {
    setUserAnswers(Array(steps.length).fill(''));
    setGameCompleted(false);
    setShowFeedback(false);
    setFeedback('');
    setMessage('');
  };

  return previewMode ? (
    <VistaPrevia
      title={title}
      description={description}
      question={question}
      textColor={textColor}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontStyle={fontStyle}
      textDecoration={textDecoration}
      textAlign={textAlign}
      containerHeight={containerHeight}
      images={images}
      correctSteps={steps}
      shuffledSteps={shuffledSteps}
      userAnswers={userAnswers}
      gameCompleted={gameCompleted}
      showFeedback={showFeedback}
      feedback={feedback}
      message={message}
      setMessage={setMessage}
      resetPreview={resetPreview}
      saveSteps={saveSteps}
      resetGame={resetGame}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
    />
  ) : (
    <Editor
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      question={question}
      setQuestion={setQuestion}
      ageGroup={ageGroup}
      setAgeGroup={setAgeGroup}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      steps={steps}
      setSteps={setSteps}
      handleStepChange={handleStepChange}
      deleteStep={deleteStep}
      addStep={addStep}
      textColor={textColor}
      setTextColor={setTextColor}
      fontSize={fontSize}
      setFontSize={setFontSize}
      fontWeight={fontWeight}
      setFontWeight={setFontWeight}
      fontStyle={fontStyle}
      setFontStyle={setFontStyle}
      textDecoration={textDecoration}
      setTextDecoration={setTextDecoration}
      textAlign={textAlign}
      setTextAlign={setTextAlign}
      containerHeight={containerHeight}
      setContainerHeight={setContainerHeight}
      images={images}
      setImages={setImages}
      updateImagePosition={updateImagePosition}
      updateImageSize={updateImageSize}
      removeImage={removeImage}
      startPreview={startPreview}
      message={message}
      setMessage={setMessage}
      containerRef={containerRef}
      limits={limits}
    />
  );
}
