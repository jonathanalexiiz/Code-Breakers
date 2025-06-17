import React from 'react';
import '../styles/VistaPrevia.css';
import 'react-quill/dist/quill.snow.css'; // Ya lo haces en Editor, hazlo también en VistaPrevia si es separado.


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
  handleDragStart,
  handleDragOver,
  handleDrop,
  resetPreview,
  saveSteps,
  resetGame,
  setMessage,
  formatText = (text) => text
}) {
  const isSequenceComplete = userAnswers.every(answer => answer.trim() !== '');
  const availableOptions = shuffledSteps.filter(step => !userAnswers.includes(step));

  const processDescriptionHTML = (html) => {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('img[data-type="resizableDraggableImage"]').forEach(img => img.remove());
    return doc.body.innerHTML;
  };

  const parseDimension = (val) => {
    if (!val || val === 'auto') return 'auto';
    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string') {
      const num = parseInt(val);
      return isNaN(num) ? 'auto' : `${num}px`;
    }
    return 'auto';
  };

  const handleOptionClick = (step) => {
    if (gameCompleted) return;
    const emptyIndex = userAnswers.findIndex(answer => answer === '');
    if (emptyIndex !== -1) {
      handleDrop({
        preventDefault: () => { },
        dataTransfer: { getData: () => step }
      }, emptyIndex);
    }
  };

  const handleSequenceClick = (index) => {
    if (gameCompleted) return;
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = '';
    // Puedes emitir al padre este cambio si lo necesitas
  };

  return (
    <div className="preview-container">
      <div className="game-container">
        <header className="game-header">
          <h2 className="game-title">{title}</h2>
        </header>

        {description && (
          <div
            className="description-preview"
            style={{
              minHeight: containerHeight ? `${containerHeight}px` : 'auto',
              position: 'relative',
              overflow: 'visible',
              padding: '10px'
            }}
          >
            <div
              className="ql-editor description-text-content"
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '0.5rem',
                lineHeight: 1.6
              }}
              dangerouslySetInnerHTML={{ __html: description }}
            />


          </div>
        )}

        {question && (
          <div className="question-box">
            <h3 className="question-text">{question}</h3>
          </div>
        )}

        <div className="game-area">
          <div className="options-section">
            <h4 className="section-title">
              Opciones disponibles: <span className="options-count">({availableOptions.length})</span>
            </h4>
            <div className="options-list">
              {availableOptions.length > 0 ? (
                availableOptions.map((step, idx) => (
                  <div
                    key={`option-${step}-${idx}`}
                    className={`option-item ${gameCompleted ? 'disabled' : 'draggable'}`}
                    draggable={!gameCompleted}
                    onDragStart={(e) => handleDragStart(e, step)}
                    onClick={() => handleOptionClick(step)}
                  >
                    <span className="option-text">{step}</span>
                  </div>
                ))
              ) : (
                <div className="no-options">
                  {gameCompleted ? '🎉 Juego completado' : '📝 Todas las opciones han sido utilizadas'}
                </div>
              )}
            </div>
          </div>

          <div className="sequence-section">
            <h4 className="section-title">
              Tu secuencia:
              {isSequenceComplete && !gameCompleted && (
                <span className="complete-indicator">¡Completa! ✅</span>
              )}
            </h4>
            <div className="sequence-list">
              {userAnswers.map((ans, i) => (
                <div
                  key={`sequence-${i}`}
                  className={`sequence-item ${gameCompleted
                    ? (ans === correctSteps[i] ? 'correct' : 'incorrect')
                    : ans ? 'filled' : 'empty'
                    }`}
                  onDragOver={!gameCompleted ? handleDragOver : undefined}
                  onDrop={!gameCompleted ? (e) => handleDrop(e, i) : undefined}
                  onClick={() => ans && handleSequenceClick(i)}
                >
                  <div className="sequence-number">{i + 1}</div>
                  {ans ? (
                    <span className="sequence-text">{ans}</span>
                  ) : (
                    <span className="placeholder-text">Arrastra aquí el paso {i + 1}</span>
                  )}
                  {gameCompleted && (
                    <div className="result-icon">
                      {ans === correctSteps[i] ? '✅' : '❌'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="game-controls">
          <div className="control-buttons">
            <button onClick={resetPreview} className="back-button">← Volver al editor</button>

            {!gameCompleted ? (
              <button
                onClick={saveSteps}
                className={`save-button ${!isSequenceComplete ? 'disabled' : ''}`}
                disabled={!isSequenceComplete}
              >
                ✔️ Verificar respuestas
              </button>
            ) : (
              <button onClick={resetGame} className="retry-button">🔄 Intentar de nuevo</button>
            )}
            
          </div>
        </div>

        {showFeedback && feedback && (
          <div className="feedback-section">
            <h3 className="feedback-title">📊 Retroalimentación</h3>
            <div className="feedback-content">
              {feedback.split('\n').map((line, index) => (
                <div
                  key={`feedback-${index}`}
                  className={`feedback-line ${line.includes('✅') ? 'correct-feedback' :
                    line.includes('❌') ? 'incorrect-feedback' : ''
                    }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('éxito') || message.includes('guardado') ? 'success-message' :
            message.includes('error') ? 'error-message' :
              message.includes('completa') ? 'warning-message' : 'info-message'
            }`}>
            <span className="message-icon">
              {message.includes('éxito') || message.includes('guardado') ? '✅' :
                message.includes('error') ? '❌' :
                  message.includes('completa') ? '⚠️' : 'ℹ️'}
            </span>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
