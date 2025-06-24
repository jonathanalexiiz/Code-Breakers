import React, { useState, useEffect } from 'react';
import '../styles/VistaPrevia.css';
import 'react-quill/dist/quill.snow.css';
import api from '../services/axiosConfig';

export default function VistaPrevia({
  title,
  description,
  question,
  containerHeight,
  shuffledSteps = [],
  userAnswers = [],
  correctSteps = [],
  gameCompleted,
  showFeedback,
  feedback,
  message,
  score = 0,
  isLoading = false,
  handleDragStart,
  handleDragOver,
  handleDrop,
  resetPreview,
  saveSteps,
  resetGame,
  setMessage,
  formatText = (text) => text,
  // Nuevas props para la integración completa
  actividadId,
  intentoId,
  isPreviewMode = false
}) {
  // Estados locales para manejar la lógica del juego
  const [localUserAnswers, setLocalUserAnswers] = useState([]);
  const [localShuffledSteps, setLocalShuffledSteps] = useState([]);
  const [localGameCompleted, setLocalGameCompleted] = useState(false);
  const [localShowFeedback, setLocalShowFeedback] = useState(false);
  const [localFeedback, setLocalFeedback] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [localScore, setLocalScore] = useState(0);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localIntentoId, setLocalIntentoId] = useState(null);


  // Agregar este efecto para asegurar que se inicie el intento
  useEffect(() => {
    console.log('VistaPrevia - Verificando inicialización:', {
      actividadId,
      intentoId,
      localIntentoId,
      isLoading: localIsLoading
    });

    // Si tenemos actividadId pero no intentoId y no estamos cargando, iniciar intento
    if (actividadId && !intentoId && !localIntentoId && !localIsLoading) {
      console.log('Iniciando nuevo intento automáticamente...');
      startNewAttempt();
    }
  }, [actividadId, intentoId, localIntentoId, localIsLoading]);
  // Funciones para el juego en vista previa
  // Inicializar estados locales
  useEffect(() => {
    if (shuffledSteps.length > 0) {
      setLocalShuffledSteps(shuffledSteps);
      setLocalUserAnswers(Array(shuffledSteps.length).fill(''));
    }
    setLocalGameCompleted(gameCompleted || false);
    setLocalShowFeedback(showFeedback || false);
    setLocalFeedback(feedback || '');
    setLocalMessage(message || '');
    setLocalScore(score || 0);
    setLocalIntentoId(intentoId);
  }, [shuffledSteps, gameCompleted, showFeedback, feedback, message, score, intentoId]);

  // Función para cargar datos del juego desde la API
  const loadGameData = async () => {
    if (!actividadId) return;

    try {
      setLocalIsLoading(true);
      setLocalMessage('Cargando actividad...');

      const response = await api.get(`/juego/actividades/${actividadId}`);

      if (response.data.success) {
        const gameData = response.data.data;
        setLocalShuffledSteps(gameData.shuffledSteps);
        setLocalUserAnswers(Array(gameData.totalSteps).fill(''));
        setLocalMessage('');
      } else {
        setLocalMessage('Error al cargar la actividad: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error cargando datos del juego:', error);
      setLocalMessage('Error al cargar los datos del juego');
    } finally {
      setLocalIsLoading(false);
    }
  };

  // Función para iniciar un nuevo intento
  const startNewAttempt = async () => {
    if (!actividadId) {
      console.error('No hay actividadId para iniciar intento');
      return;
    }

    try {
      setLocalIsLoading(true);
      setLocalMessage('Iniciando nuevo intento...');

      console.log('Iniciando intento para actividad:', actividadId);
      console.log('Modo preview:', isPreviewMode);

      const payload = isPreviewMode ? { preview_mode: true } : {};
      const response = await api.post(`/juego/actividades/${actividadId}/intentos`, payload);

      console.log('Respuesta del servidor:', response.data);

      if (response.data.success) {
        const newIntentoId = response.data.data.intento_id;
        console.log('Nuevo intento creado:', newIntentoId);

        setLocalIntentoId(newIntentoId);
        setLocalGameCompleted(false);
        setLocalShowFeedback(false);
        setLocalFeedback('');
        setLocalScore(0);
        setLocalMessage('');

        // Cargar datos del juego si no los tenemos
        if (localShuffledSteps.length === 0) {
          console.log('Cargando datos del juego...');
          await loadGameData();
        }
      } else {
        console.error('Error en respuesta del servidor:', response.data.message);
        setLocalMessage('Error al iniciar intento: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error completo al iniciar intento:', error);
      console.error('Response data:', error.response?.data);
      setLocalMessage('Error al iniciar el intento: ' + (error.response?.data?.message || error.message));
    } finally {
      setLocalIsLoading(false);
    }
  };


  // Función para enviar respuestas al backend
  const submitAnswers = async () => {
    console.log('Enviando respuestas:', {
      intentoId: localIntentoId,
      userAnswers: localUserAnswers,
      answersLength: localUserAnswers.length
    });

    if (!localIntentoId) {
      console.error('No hay intento activo');
      setLocalMessage('Error: No hay intento activo. Reiniciando...');
      await startNewAttempt();
      return;
    }

    if (localUserAnswers.some(answer => answer.trim() === '')) {
      console.warn('Respuestas incompletas:', localUserAnswers);
      setLocalMessage('Por favor, completa todos los pasos antes de enviar.');
      return;
    }

    try {
      setLocalIsLoading(true);
      setLocalMessage('Evaluando respuestas...');

      const payload = {
        userAnswers: localUserAnswers
      };

      console.log('Enviando payload:', payload);

      const response = await api.post(`/juego/intentos/${localIntentoId}/respuestas`, payload);

      console.log('Respuesta de evaluación:', response.data);

      if (response.data.success) {
        const result = response.data.data;
        setLocalGameCompleted(true);
        setLocalShowFeedback(true);
        setLocalFeedback(result.feedback);
        setLocalMessage(result.message);
        setLocalScore(result.score);

        // Notificar al componente padre si existe la función
        if (setMessage) {
          setMessage(result.message);
        }
      } else {
        console.error('Error en evaluación:', response.data.message);
        setLocalMessage('Error al evaluar respuestas: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error completo al enviar respuestas:', error);
      console.error('Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.message;
      setLocalMessage('Error al enviar las respuestas: ' + errorMessage);

      // Si es un error de intento no encontrado, intentar crear uno nuevo
      if (errorMessage.includes('Intento no encontrado')) {
        console.log('Intento no encontrado, creando uno nuevo...');
        await startNewAttempt();
      }
    } finally {
      setLocalIsLoading(false);
    }
  };

  // Función para reiniciar el juego
  const restartGame = async () => {
    if (!localIntentoId) {
      setLocalMessage('Error: No hay intento activo.');
      return;
    }

    try {
      setLocalIsLoading(true);
      setLocalMessage('Reiniciando juego...');

      const response = await api.post(`/juego/intentos/${localIntentoId}/reiniciar`);

      if (response.data.success) {
        setLocalIntentoId(response.data.data.intento_id);
        setLocalUserAnswers(Array(localShuffledSteps.length).fill(''));
        setLocalGameCompleted(false);
        setLocalShowFeedback(false);
        setLocalFeedback('');
        setLocalMessage('');
        setLocalScore(0);

        // Recargar datos del juego para obtener nuevos pasos mezclados
        await loadGameData();
      } else {
        setLocalMessage('Error al reiniciar: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error reiniciando juego:', error);
      setLocalMessage('Error al reiniciar el juego');
    } finally {
      setLocalIsLoading(false);
    }
  };

  // Función para manejar drag and drop
  const handleInternalDragStart = (e, step) => {
    e.dataTransfer.setData('text/plain', step);
    if (handleDragStart) {
      handleDragStart(e, step);
    }
  };

  const handleInternalDragOver = (e) => {
    e.preventDefault();
    if (handleDragOver) {
      handleDragOver(e);
    }
  };

  const handleInternalDrop = (e, index) => {
    e.preventDefault();
    if (localGameCompleted || localIsLoading) return;

    const step = e.dataTransfer.getData('text/plain');
    if (!step) return;

    const updatedAnswers = [...localUserAnswers];
    updatedAnswers[index] = step;
    setLocalUserAnswers(updatedAnswers);

    if (handleDrop) {
      handleDrop(e, index);
    }
  };

  // Función para manejar click en opciones
  const handleOptionClick = (step) => {
    if (localGameCompleted || localIsLoading) return;

    const emptyIndex = localUserAnswers.findIndex(answer => answer === '');
    if (emptyIndex !== -1) {
      const updatedAnswers = [...localUserAnswers];
      updatedAnswers[emptyIndex] = step;
      setLocalUserAnswers(updatedAnswers);
    }
  };

  // Función para manejar click en secuencia (remover item)
  const handleSequenceClick = (index) => {
    if (localGameCompleted || localIsLoading) return;

    const updatedAnswers = [...localUserAnswers];
    updatedAnswers[index] = '';
    setLocalUserAnswers(updatedAnswers);
  };

  // Procesar HTML de la descripción
  const processDescriptionHTML = (html) => {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('img[data-type="resizableDraggableImage"]').forEach(img => img.remove());
    return doc.body.innerHTML;
  };

  // Funciones para score y mensajes
  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    if (score >= 50) return '#FFC107';
    return '#F44336';
  };

  const getScoreMessage = (score) => {
    if (score === 100) return '¡Perfecto! 🎉';
    if (score >= 90) return '¡Excelente! 🌟';
    if (score >= 70) return '¡Muy bien! 👍';
    if (score >= 50) return 'Buen intento 💪';
    return '¡Sigue practicando! 📚';
  };

  // Calcular opciones disponibles
  const isSequenceComplete = localUserAnswers.every(answer => answer.trim() !== '');
  const availableOptions = localShuffledSteps.filter(step => !localUserAnswers.includes(step));

  // Efecto para inicializar el juego si no hay intento activo
  useEffect(() => {
    if (actividadId && !localIntentoId && !localIsLoading) {
      startNewAttempt();
    }
  }, [actividadId]);

  return (
    <div className="game-container">
      {/* Header del juego */}
      <div className="game-header">
        <h2 className="game-title">{title}</h2>
        {localGameCompleted && (
          <div className="score-display">
            <div className="score-number">
              {Math.round(localScore)}%
            </div>
            <div className="score-message">{getScoreMessage(localScore)}</div>
          </div>
        )}
      </div>

      {/* Descripción */}
      {description && (
        <div className="description-container">
          <div
            className="description-text"
            dangerouslySetInnerHTML={{ __html: processDescriptionHTML(description) }}
          />
        </div>
      )}

      {/* Pregunta */}
      {question && (
        <div className="question-container">
          <h3 className="question-title">{question}</h3>
        </div>
      )}

      {/* Layout de dos columnas */}
      <div className="game-layout">
        {/* Columna izquierda - Opciones disponibles */}
        <div className="options-column">
          <div className="options-section">
            <h4 className="options-header">
              Opciones disponibles:
              <span className="options-count">
                {availableOptions.length}
              </span>
            </h4>
            <div className="options-list">
              {availableOptions.length > 0 ? (
                availableOptions.map((step, idx) => (
                  <div
                    key={`option-${step}-${idx}`}
                    className={`option-item ${localGameCompleted || localIsLoading ? 'disabled' : ''}`}
                    draggable={!localGameCompleted && !localIsLoading}
                    onDragStart={(e) => handleInternalDragStart(e, step)}
                    onClick={() => handleOptionClick(step)}
                  >
                    <span className="option-text">{step}</span>
                  </div>
                ))
              ) : (
                <div className="empty-options">
                  {localGameCompleted ? '🎉 Juego completado' : '📝 Todas las opciones han sido utilizadas'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Secuencia del usuario */}
        <div className="sequence-column">
          <div className="sequence-section">
            <h4 className="sequence-header">
              Tu secuencia
              {isSequenceComplete && !localGameCompleted && (
                <span className="sequence-complete-badge">
                  ¡Completa! ✅
                </span>
              )}
            </h4>
            <div className="sequence-list">
              {localUserAnswers.map((ans, i) => (
                <div
                  key={`sequence-${i}`}
                  className={`sequence-item ${
                    localGameCompleted
                      ? (ans === correctSteps[i] ? 'correct' : 'incorrect')
                      : ans
                      ? 'filled'
                      : 'empty'
                  }`}
                  onDragOver={!localGameCompleted && !localIsLoading ? handleInternalDragOver : undefined}
                  onDrop={!localGameCompleted && !localIsLoading ? (e) => handleInternalDrop(e, i) : undefined}
                  onClick={() => ans && handleSequenceClick(i)}
                >
                  <div className="sequence-number">
                    {i + 1}
                  </div>
                  {ans ? (
                    <span className="sequence-text">{ans}</span>
                  ) : (
                    <span className="sequence-placeholder">
                      {localIsLoading ? 'Procesando...' : `Arrastra aquí el paso ${i + 1}`}
                    </span>
                  )}
                  {localGameCompleted && (
                    <div className="sequence-result">
                      {ans === correctSteps[i] ? '✅' : '❌'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controles del juego */}
      <div className="game-controls">
        <button
          onClick={resetPreview || (() => { })}
          className="control-button secondary"
          disabled={localIsLoading}
        >
          ← Volver al editor
        </button>

        {!localGameCompleted ? (
          <button
            onClick={submitAnswers}
            className={`control-button primary ${(!isSequenceComplete || localIsLoading) ? 'disabled' : ''}`}
            disabled={!isSequenceComplete || localIsLoading}
          >
            {localIsLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Evaluando...
              </>
            ) : (
              <>✔️ Verificar respuestas</>
            )}
          </button>
        ) : (
          <button
            onClick={restartGame}
            className="control-button success"
            disabled={localIsLoading}
          >
            {localIsLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Reiniciando...
              </>
            ) : (
              <>🔄 Intentar de nuevo</>
            )}
          </button>
        )}
      </div>

      {/* Retroalimentación */}
      {localShowFeedback && localFeedback && (
        <div className="feedback-container">
          <h3 className="feedback-title">📊 Retroalimentación</h3>
          <div className="feedback-content">
            {localFeedback.split('\n').map((line, index) => (
              <div
                key={`feedback-${index}`}
                className={`feedback-line ${
                  line.includes('✅') ? 'correct' :
                  line.includes('❌') ? 'incorrect' : 'neutral'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
          {localGameCompleted && (
            <div className="feedback-summary">
              <h4 className="summary-title">Resumen del resultado:</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Puntuación:</span>
                  <span
                    className="summary-value"
                    style={{ color: getScoreColor(localScore) }}
                  >
                    {Math.round(localScore)}%
                  </span>
                </div>
                <div className="summary-item">
                  <span>Respuestas correctas:</span>
                  <span className="summary-value">
                    {localUserAnswers.filter((ans, i) => ans === correctSteps[i]).length} / {correctSteps.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mensaje de estado */}
      {localMessage && (
        <div className={`status-message ${
          localMessage.includes('éxito') || localMessage.includes('guardado') || localMessage.includes('Perfecto')
            ? 'success' :
          localMessage.includes('error') || localMessage.includes('Error')
            ? 'error' :
          localMessage.includes('completa') || localMessage.includes('Evaluando') || localMessage.includes('Procesando')
            ? 'warning' : 'info'
        }`}>
          <span className="status-icon">
            {localIsLoading ? '⏳' :
              localMessage.includes('éxito') || localMessage.includes('guardado') || localMessage.includes('Perfecto') ? '✅' :
                localMessage.includes('error') || localMessage.includes('Error') ? '❌' :
                  localMessage.includes('completa') ? '⚠️' : 'ℹ️'}
          </span>
          <span className="status-text">{localMessage}</span>
        </div>
      )}

      {/* Overlay de carga */}
      {localIsLoading && (
        <div className="loading-overlay">
          <div className="loading-modal">
            <div className="loading-icon">⏳</div>
            <div className="loading-text">Procesando...</div>
          </div>
        </div>
      )}
    </div>
  );
}