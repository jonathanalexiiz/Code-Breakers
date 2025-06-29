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
  isPreviewMode = false,
  textStyles = {},
  images = [],
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

  const descriptionStyle = {
    minHeight: `${containerHeight}px`,
    textAlign: 'left', 
  };

  useEffect(() => {
    console.log('VistaPrevia - Verificando inicialización:', {
      actividadId,
      intentoId,
      localIntentoId,
      isLoading: localIsLoading
    });
    if (actividadId && !intentoId && !localIntentoId && !localIsLoading) {
      
      startNewAttempt();
    }
  }, [actividadId, intentoId, localIntentoId, localIsLoading]);
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
      setLocalMessage('Error al cargar los datos del juego');
    } finally {
      setLocalIsLoading(false);
    }
  };

  const startNewAttempt = async () => {
    if (!actividadId || isPreviewMode) {
      return;
    }

    try {
      setLocalIsLoading(true);
      setLocalMessage('Iniciando nuevo intento...');

      const response = await api.post(`/juego/actividades/${actividadId}/intentos`);

      if (response.data.success) {
        const newIntentoId = response.data.data.intento_id;
        setLocalIntentoId(newIntentoId);
        setLocalGameCompleted(false);
        setLocalShowFeedback(false);
        setLocalFeedback('');
        setLocalScore(0);
        setLocalMessage('');

        if (localShuffledSteps.length === 0) {
          await loadGameData();
        }
      } else {
        setLocalMessage('Error al iniciar intento: ' + response.data.message);
      }
    } catch (error) {
      setLocalMessage('Error al iniciar el intento: ' + (error.response?.data?.message || error.message));
    } finally {
      setLocalIsLoading(false);
    }
  };


  const submitAnswers = async () => {

    if (localUserAnswers.some(answer => answer.trim() === '')) {
      setLocalMessage('Por favor, completa todos los pasos antes de enviar.');
      return;
    }

    if (isPreviewMode) {
      const correctCount = localUserAnswers.filter((ans, i) => ans === correctSteps[i]).length;
      const total = correctSteps.length;
      const simulatedScore = (correctCount / total) * 100;

      setLocalGameCompleted(true);
      setLocalShowFeedback(true);
      setLocalFeedback(
        correctSteps.map((step, i) =>
          localUserAnswers[i] === step
            ? `Paso ${i + 1}: ✅ Correcto`
            : `Paso ${i + 1}: ❌ Incorrecto (Esperado: "${step}")`
        ).join('\n')
      );
      setLocalMessage('Vista previa evaluada correctamente.');
      setLocalScore(simulatedScore);
      return;
    }

    if (!localIntentoId) {
      setLocalMessage('Error: No hay intento activo. Reiniciando...');
      await startNewAttempt();
      return;
    }

    try {
      setLocalIsLoading(true);
      setLocalMessage('Evaluando respuestas...');

      const payload = {
        userAnswers: localUserAnswers
      };

      const response = await api.post(`/juego/intentos/${localIntentoId}/respuestas`, payload);

      if (response.data.success) {
        const result = response.data.data;
        setLocalGameCompleted(true);
        setLocalShowFeedback(true);
        setLocalFeedback(result.feedback);
        setLocalMessage(result.message);
        setLocalScore(result.score);

        if (setMessage) {
          setMessage(result.message);
        }
      } else {
        setLocalMessage('Error al evaluar respuestas: ' + response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setLocalMessage('Error al enviar las respuestas: ' + errorMessage);

      if (errorMessage.includes('Intento no encontrado')) {
        await startNewAttempt();
      }
    } finally {
      setLocalIsLoading(false);
    }
  };

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

        await loadGameData();
      } else {
        setLocalMessage('Error al reiniciar: ' + response.data.message);
      }
    } catch (error) {
      setLocalMessage('Error al reiniciar el juego');
    } finally {
      setLocalIsLoading(false);
    }
  };

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

  const handleOptionClick = (step) => {
    if (localGameCompleted || localIsLoading) return;

    const emptyIndex = localUserAnswers.findIndex(answer => answer === '');
    if (emptyIndex !== -1) {
      const updatedAnswers = [...localUserAnswers];
      updatedAnswers[emptyIndex] = step;
      setLocalUserAnswers(updatedAnswers);
    }
  };

  const handleSequenceClick = (index) => {
    if (localGameCompleted || localIsLoading) return;

    const updatedAnswers = [...localUserAnswers];
    updatedAnswers[index] = '';
    setLocalUserAnswers(updatedAnswers);
  };

  const processDescriptionHTML = (html) => {
    return html || '';
  };

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

  const isSequenceComplete = localUserAnswers.every(answer => answer.trim() !== '');
  const availableOptions = localShuffledSteps.filter(step => !localUserAnswers.includes(step));

  useEffect(() => {
    if (isPreviewMode) return;

    if (actividadId && !localIntentoId && !localIsLoading) {
      startNewAttempt();
    }
  }, [actividadId]);

  return (
    <div className="vista-previa-fullscreen">
      
      <div className="game-header">
        <h2 className="game-title">{title}</h2>
        {localGameCompleted && (
          <div className="score-display">
            <div
              className="score-number"
              style={{ color: getScoreColor(localScore) }}
            >
              {Math.round(localScore)}%
            </div>
            <div className="score-message">{getScoreMessage(localScore)}</div>
          </div>
        )}
      </div>

      {description && (
        <div className="description-container">
          <div
            className="quill-html-rendered"
            style={textStyles}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>


      )}
      
      {question && (
        <div className="question-container">
          <h3 className="question-title">{question}</h3>
        </div>
      )}

      <div className="game-layout">
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
                  className={`sequence-item ${localGameCompleted
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

      <div className="game-controls">
        <button
          onClick={resetPreview || (() => { })}
          className="control-button secondary"
          disabled={localIsLoading}
        >
          <span className="button-icon">←</span>
          Volver al editor
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
              <>
                <span className="button-icon">✔️</span>
                Verificar respuestas
              </>
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
              <>
                <span className="button-icon">🔄</span>
                Intentar de nuevo
              </>
            )}
          </button>
        )}
      </div>

      {localShowFeedback && localFeedback && (
        <div className="feedback-container">
          <h3 className="feedback-title">📊 Retroalimentación</h3>
          <div className="feedback-content">
            {localFeedback.split('\n').map((line, index) => (
              <div
                key={`feedback-${index}`}
                className={`feedback-line ${line.includes('✅') ? 'correct' :
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

      {localMessage && (
        <div className={`status-message ${localMessage.includes('éxito') || localMessage.includes('guardado') || localMessage.includes('Perfecto')
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