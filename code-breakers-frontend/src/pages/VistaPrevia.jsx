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
    if (!actividadId) return;

    try {
      setLocalIsLoading(true);
      setLocalMessage('Iniciando nuevo intento...');

      const payload = isPreviewMode ? { preview_mode: true } : {};
      const response = await api.post(`/juego/actividades/${actividadId}/intentos`, payload);
      
      if (response.data.success) {
        setLocalIntentoId(response.data.data.intento_id);
        setLocalGameCompleted(false);
        setLocalShowFeedback(false);
        setLocalFeedback('');
        setLocalScore(0);
        setLocalMessage('');
        
        // Cargar datos del juego si no los tenemos
        if (localShuffledSteps.length === 0) {
          await loadGameData();
        }
      } else {
        setLocalMessage('Error al iniciar intento: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error iniciando intento:', error);
      setLocalMessage('Error al iniciar el intento');
    } finally {
      setLocalIsLoading(false);
    }
  };

  // Función para enviar respuestas al backend
  const submitAnswers = async () => {
    if (!localIntentoId) {
      setLocalMessage('Error: No hay intento activo.');
      return;
    }

    if (localUserAnswers.some(answer => answer.trim() === '')) {
      setLocalMessage('Por favor, completa todos los pasos antes de enviar.');
      return;
    }

    try {
      setLocalIsLoading(true);
      setLocalMessage('Evaluando respuestas...');

      const response = await api.post(`/juego/intentos/${localIntentoId}/respuestas`, {
        userAnswers: localUserAnswers
      });

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
        setLocalMessage('Error al evaluar respuestas: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error enviando respuestas:', error);
      setLocalMessage('Error al enviar las respuestas');
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
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="game-container">
        {/* Header del juego */}
        <header className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {localGameCompleted && (
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: getScoreColor(localScore) }}
              >
                {Math.round(localScore)}%
              </div>
              <div className="text-sm text-gray-600">{getScoreMessage(localScore)}</div>
            </div>
          )}
        </header>

        {/* Descripción */}
        {description && (
          <div
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
            style={{
              minHeight: containerHeight ? `${containerHeight}px` : 'auto',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            <div
              className="prose prose-sm max-w-none"
              style={{
                position: 'relative',
                zIndex: 1,
                lineHeight: 1.6
              }}
              dangerouslySetInnerHTML={{ __html: processDescriptionHTML(description) }}
            />
          </div>
        )}

        {/* Pregunta */}
        {question && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <h3 className="text-lg font-semibold text-blue-800">{question}</h3>
          </div>
        )}

        {/* Área del juego */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Opciones disponibles */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              Opciones disponibles
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {availableOptions.length}
              </span>
            </h4>
            <div className="space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
              {availableOptions.length > 0 ? (
                availableOptions.map((step, idx) => (
                  <div
                    key={`option-${step}-${idx}`}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      localGameCompleted || localIsLoading 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    draggable={!localGameCompleted && !localIsLoading}
                    onDragStart={(e) => handleInternalDragStart(e, step)}
                    onClick={() => handleOptionClick(step)}
                  >
                    <span className="text-sm">{step}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {localGameCompleted ? '🎉 Juego completado' : '📝 Todas las opciones han sido utilizadas'}
                </div>
              )}
            </div>
          </div>

          {/* Secuencia del usuario */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              Tu secuencia
              {isSequenceComplete && !localGameCompleted && (
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                  ¡Completa! ✅
                </span>
              )}
            </h4>
            <div className="space-y-2">
              {localUserAnswers.map((ans, i) => (
                <div
                  key={`sequence-${i}`}
                  className={`p-3 border rounded-lg min-h-[50px] flex items-center gap-3 transition-all ${
                    localGameCompleted
                      ? (ans === correctSteps[i] ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300')
                      : ans 
                        ? 'bg-blue-50 border-blue-300 cursor-pointer hover:bg-blue-100' 
                        : 'bg-gray-50 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100'
                  }`}
                  onDragOver={!localGameCompleted && !localIsLoading ? handleInternalDragOver : undefined}
                  onDrop={!localGameCompleted && !localIsLoading ? (e) => handleInternalDrop(e, i) : undefined}
                  onClick={() => ans && handleSequenceClick(i)}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </div>
                  {ans ? (
                    <span className="text-sm flex-1">{ans}</span>
                  ) : (
                    <span className="text-sm text-gray-500 flex-1">
                      {localIsLoading ? 'Procesando...' : `Arrastra aquí el paso ${i + 1}`}
                    </span>
                  )}
                  {localGameCompleted && (
                    <div className="flex-shrink-0">
                      {ans === correctSteps[i] ? '✅' : '❌'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controles del juego */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button 
            onClick={resetPreview || (() => {})}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={localIsLoading}
          >
            ← Volver al editor
          </button>

          {!localGameCompleted ? (
            <button
              onClick={submitAnswers}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                (!isSequenceComplete || localIsLoading) 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={!isSequenceComplete || localIsLoading}
            >
              {localIsLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Evaluando...
                </>
              ) : (
                <>✔️ Verificar respuestas</>
              )}
            </button>
          ) : (
            <button 
              onClick={restartGame}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={localIsLoading}
            >
              {localIsLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
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
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">📊 Retroalimentación</h3>
            <div className="space-y-2">
              {localFeedback.split('\n').map((line, index) => (
                <div
                  key={`feedback-${index}`}
                  className={`p-2 rounded ${
                    line.includes('✅') ? 'bg-green-100 text-green-800' :
                    line.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
            {localGameCompleted && (
              <div className="mt-4 p-3 bg-white border border-yellow-300 rounded">
                <h4 className="font-semibold text-gray-700 mb-2">Resumen del resultado:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Puntuación:</span>
                    <span 
                      className="font-bold"
                      style={{ color: getScoreColor(localScore) }}
                    >
                      {Math.round(localScore)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Respuestas correctas:</span>
                    <span className="font-bold">
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
          <div className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
            localMessage.includes('éxito') || localMessage.includes('guardado') || localMessage.includes('Perfecto') 
              ? 'bg-green-100 border border-green-300 text-green-800' :
            localMessage.includes('error') || localMessage.includes('Error') 
              ? 'bg-red-100 border border-red-300 text-red-800' :
            localMessage.includes('completa') || localMessage.includes('Evaluando') || localMessage.includes('Procesando') 
              ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' 
              : 'bg-blue-100 border border-blue-300 text-blue-800'
          }`}>
            <span className="text-lg">
              {localIsLoading ? '⏳' :
                localMessage.includes('éxito') || localMessage.includes('guardado') || localMessage.includes('Perfecto') ? '✅' :
                localMessage.includes('error') || localMessage.includes('Error') ? '❌' :
                localMessage.includes('completa') ? '⚠️' : 'ℹ️'}
            </span>
            <span>{localMessage}</span>
          </div>
        )}

        {/* Overlay de carga */}
        {localIsLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <div className="text-lg font-semibold text-gray-700">Procesando...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}