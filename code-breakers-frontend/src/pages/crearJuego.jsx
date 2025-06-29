import React, { useState, useRef } from 'react';
import Editor from './editor';
import VistaPrevia from './VistaPrevia';
import api from '../services/axiosConfig';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Estados para la vista previa del juego
  const [actividadId, setActividadId] = useState(null);
  const [intentoId, setIntentoId] = useState(null);
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [gameMessage, setGameMessage] = useState('');
  const [score, setScore] = useState(0);

  const containerRef = useRef(null);

  const limits = {
    facil: 3,
    intermedio: 5,
    dificil: 7
  };

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

  // Función para validar la actividad usando la API
  const validateActivity = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/actividades/validate', {
        title: title.trim(),
        description: description.trim(),
        question: question.trim(),
        ageGroup,
        difficulty,
        steps: steps.filter(step => step.trim() !== '')
      });

      if (response.data.success) {
        setMessage('');
        return true;
      } else {
        setMessage(response.data.message || 'Error de validación');
        return false;
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        setMessage(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setMessage('Error al validar la actividad');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar la actividad
  const saveActivity = async () => {
    try {
      setIsSaving(true);
      setMessage('Guardando actividad...');

      const activityData = {
        title: title.trim(),
        description: description.trim(),
        question: question.trim(),
        ageGroup,
        difficulty,
        steps: steps.filter(step => step.trim() !== ''),
        images: images.map(img => ({
          src: img.src,
          width: img.width,
          height: img.height,
          x: img.x,
          y: img.y
        })),
        textStyles: {
          textColor,
          fontSize,
          fontWeight,
          fontStyle,
          textDecoration,
          textAlign,
          containerHeight
        }
      };

      const response = await api.post('/actividades', activityData);

      if (response.data.success) {
        setMessage('¡Actividad guardada exitosamente!');
        setActividadId(response.data.data.id);
      } else {
        setMessage(response.data.message || 'Error al guardar la actividad');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        setMessage(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setMessage('Error al guardar la actividad');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setQuestion('');
    setAgeGroup('');
    setDifficulty('');
    setSteps([]);
    setImages([]);
    setTextColor('#000000');
    setFontSize('16px');
    setFontWeight('normal');
    setFontStyle('normal');
    setTextDecoration('none');
    setTextAlign('left');
    setContainerHeight(300);
    setMessage('');
    setActividadId(null);
    resetGameState();
  };

  const resetGameState = () => {
    setIntentoId(null);
    setShuffledSteps([]);
    setUserAnswers([]);
    setGameCompleted(false);
    setShowFeedback(false);
    setFeedback('');
    setGameMessage('');
    setScore(0);
  };

  // Función para iniciar la vista previa del juego

  const startPreview = () => {
    // Validación básica local
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

    // 🟢 Primero limpiar estado previo
    resetGameState();

    // ✅ Luego mezclar pasos y preparar Vista Previa
    const mezclados = [...steps].sort(() => Math.random() - 0.5);
    setShuffledSteps(mezclados);
    setUserAnswers(Array(mezclados.length).fill(''));

    setPreviewMode(true);
    setMessage('');
  };

  const resetPreview = () => {
    setPreviewMode(false);
    resetGameState();
    setMessage('');
  };

  // Funciones para el juego en vista previa
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

  // Función para enviar respuestas al backend
  const saveSteps = async () => {
    if (!intentoId) {
      setGameMessage('Error: No hay intento activo.');
      return;
    }

    try {
      setIsLoading(true);
      setGameMessage('Evaluando respuestas...');

      const response = await api.post(`/juego/intentos/${intentoId}/respuestas`, {
        userAnswers: userAnswers
      });

      if (response.data.success) {
        const result = response.data.data;
        setGameCompleted(true);
        setShowFeedback(true);
        setFeedback(result.feedback);
        setGameMessage(result.message);
        setScore(result.score);
      } else {
        setGameMessage('Error al evaluar respuestas: ' + response.data.message);
      }
    } catch (error) {
      setGameMessage('Error al enviar las respuestas');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reiniciar el juego
  const resetGame = async () => {
    if (!intentoId) {
      setGameMessage('Error: No hay intento activo.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post(`/juego/intentos/${intentoId}/reiniciar`);

      if (response.data.success) {
        setIntentoId(response.data.data.intento_id);
        setUserAnswers(Array(steps.length).fill(''));
        setGameCompleted(false);
        setShowFeedback(false);
        setFeedback('');
        setGameMessage('');
        setScore(0);

        // Volver a mezclar los pasos
        const shuffled = [...steps].sort(() => Math.random() - 0.5);
        setShuffledSteps(shuffled);
      } else {
        setGameMessage('Error al reiniciar: ' + response.data.message);
      }
    } catch (error) {
      setGameMessage('Error al reiniciar el juego');
    } finally {
      setIsLoading(false);
    }
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
      // Props necesarias para la integración completa
      actividadId={actividadId}
      intentoId={intentoId}
      isPreviewMode={true}
      // Props del estado del juego
      correctSteps={steps}
      shuffledSteps={shuffledSteps}
      userAnswers={userAnswers}
      gameCompleted={gameCompleted}
      showFeedback={showFeedback}
      feedback={feedback}
      message={gameMessage}
      score={score}
      isLoading={isLoading}
      // Funciones de control
      setMessage={setGameMessage}
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
      saveActivity={saveActivity}
      resetForm={resetForm}
      message={message}
      setMessage={setMessage}
      containerRef={containerRef}
      limits={limits}
      isLoading={isLoading}
      isSaving={isSaving}
    />
  );
}