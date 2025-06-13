import React, { useState, useRef, useEffect } from 'react';
import '../styles/crearJuego.css';
export default function CrearJuego() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [steps, setSteps] = useState(['']);
  const [correctSteps, setCorrectSteps] = useState([]);
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16px');
  const [textAlign, setTextAlign] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [images, setImages] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [containerHeight, setContainerHeight] = useState(200);
  const descriptionRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const limits = { facil: 6, intermedio: 8, dificil: 10 };
  useEffect(() => {
    if (images.length > 0) {
      const maxImageBottom = Math.max(...images.map(img => img.y + img.height));
      const minHeight = Math.max(200, maxImageBottom + 20); // 20px de padding
      setContainerHeight(minHeight);
    } else {setContainerHeight(200);}
  }, [images]);
  const insertImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newImage = {
          id: Date.now().toString(),
          src: reader.result,
          width: 200,
          height: 150,
          x: 20,
          y: 20
        };
        setImages([...images, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };
  const updateImageSize = (id, newWidth, newHeight) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxWidth = containerRect.width - 40; // 20px padding on each side
    
    const img = images.find(img => img.id === id);
    if (!img) return;
    
    // Limitar el tamaño para que no se salga del contenedor
    const constrainedWidth = Math.max(50, Math.min(newWidth, maxWidth - img.x));
    const constrainedHeight = Math.max(50, newHeight);
    
    setImages(images.map(img => 
      img.id === id ? { 
        ...img, 
        width: constrainedWidth, 
        height: constrainedHeight 
      } : img
    ));
  };
  const updateImagePosition = (id, x, y) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const img = images.find(img => img.id === id);
    if (!img) return;
    
    // Limitar posición para que la imagen no se salga del contenedor
    const maxX = containerRect.width - img.width - 20; // 20px padding
    const maxY = Math.max(0, containerHeight - img.height - 20);
    
    const constrainedX = Math.max(20, Math.min(x, maxX));
    const constrainedY = Math.max(20, Math.min(y, maxY));
    
    setImages(images.map(img => 
      img.id === id ? { 
        ...img, 
        x: constrainedX, 
        y: constrainedY 
      } : img
    ));
  };
  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };
  const applyFormatting = (command) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      let formattedText = selectedText;
      
      switch (command) {
        case 'bold':
          formattedText = isBold ? selectedText : `**${selectedText}**`;
          setIsBold(!isBold);
          break;
        case 'italic':
          formattedText = isItalic ? selectedText : `*${selectedText}*`;
          setIsItalic(!isItalic);
          break;
      }
      
      const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      setDescription(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }, 0);
    }
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };
  const addStep = () => {
    if (!difficulty) return setMessage('Selecciona una dificultad antes de agregar pasos.');
    if (steps.length >= limits[difficulty]) {
      return setMessage(`Límite alcanzado: máximo ${limits[difficulty]} pasos.`);
    }
    setSteps([...steps, '']);
    setMessage('');
  };

  const deleteStep = (index) => {
    const updatedSteps = steps.filter((_, idx) => idx !== index);
    setSteps(updatedSteps);
  };

  const startPreview = () => {
    if (!ageGroup || !difficulty) {
      return setMessage('Selecciona un rango de edad y una dificultad.');
    }
    const filtered = steps.filter((s) => s.trim() !== '');
    if (filtered.length < 2) return setMessage('Agrega al menos 2 pasos.');
    if (filtered.length > limits[difficulty]) {
      return setMessage(`Has excedido el límite de pasos (${limits[difficulty]}).`);
    }

    setCorrectSteps(filtered);
    setShuffledSteps([...filtered].sort(() => Math.random() - 0.5));
    setUserAnswers(new Array(filtered.length).fill(null));
    setDragItem(null);
    setGameCompleted(false);
    setIsPreview(true);
    setMessage('');
    setShowFeedback(false);
    setFeedback('');
  };

  const resetPreview = () => {
    setIsPreview(false);
    setUserAnswers([]);
    setDragItem(null);
    setGameCompleted(false);
    setMessage('');
    setShowFeedback(false);
    setFeedback('');
  };

  const handleDragStart = (e, item) => {
    if (!gameCompleted) {
      setDragItem(item);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (gameCompleted || !dragItem) return;

    const newAnswers = [...userAnswers];
    newAnswers[index] = dragItem;
    setUserAnswers(newAnswers);
    setDragItem(null);
    setMessage('');
  };

  const saveSteps = () => {
    if (userAnswers.some(answer => answer === null)) {
      setMessage('Por favor, completa todos los pasos antes de guardar.');
      return;
    }
    
    setGameCompleted(true);
    generateFeedback();
    setMessage('Pasos guardados. Revisa tu retroalimentación.');
  };

  const generateFeedback = () => {
    let correctCount = 0;
    let feedbackDetails = [];
    
    userAnswers.forEach((userAnswer, index) => {
      if (userAnswer === correctSteps[index]) {
        correctCount++;
        feedbackDetails.push(`✅ Paso ${index + 1}: Correcto - "${userAnswer}"`);
      } else {
        feedbackDetails.push(`❌ Paso ${index + 1}: Incorrecto`);
        feedbackDetails.push(`   Tu respuesta: "${userAnswer}"`);
        feedbackDetails.push(`   Respuesta correcta: "${correctSteps[index]}"`);
      }
    });

    const percentage = Math.round((correctCount / correctSteps.length) * 100);
    let overallFeedback = '';
    
    if (percentage === 100) {
      overallFeedback = '🎉 ¡Excelente! Has completado la secuencia perfectamente.';
    } else if (percentage >= 70) {
      overallFeedback = '👍 ¡Buen trabajo! Tienes la mayoría de pasos correctos.';
    } else if (percentage >= 50) {
      overallFeedback = '📚 Bien intentado. Revisa algunos pasos para mejorar.';
    } else {
      overallFeedback = '💪 Sigue practicando. Puedes mejorar revisando el material.';
    }

    const finalFeedback = `${overallFeedback}\n\nPuntuación: ${correctCount}/${correctSteps.length} (${percentage}%)\n\nDetalles:\n${feedbackDetails.join('\n')}`;
    
    setFeedback(finalFeedback);
    setShowFeedback(true);
  };

  const resetGame = () => {
    setShuffledSteps([...correctSteps].sort(() => Math.random() - 0.5));
    setUserAnswers(new Array(correctSteps.length).fill(null));
    setGameCompleted(false);
    setShowFeedback(false);
    setFeedback('');
    setMessage('');
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <div className="crear-juego">
      {!isPreview ? (
        <div className="editor-container">
          <h2 className="editor-title">Crear Actividad</h2>

          <div className="form-section">
            <div className="input-group">
              <label className="input-label">Título:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-input"
                placeholder="Ingresa el título de la actividad"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Descripción:</label>
              <div className="description-editor">
                <div className="toolbar">
                  <button
                    onClick={() => applyFormatting('bold')}
                    className={`toolbar-button ${isBold ? 'active' : ''}`}
                    title="Negrita"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    onClick={() => applyFormatting('italic')}
                    className={`toolbar-button ${isItalic ? 'active' : ''}`}
                    title="Cursiva"
                  >
                    <em>I</em>
                  </button>
                  <select
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value)}
                    className="toolbar-select"
                  >
                    <option value="left">← Izq</option>
                    <option value="center">↔ Centro</option>
                    <option value="right">→ Der</option>
                  </select>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="color-input"
                    title="Color del texto"
                  />
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="toolbar-select"
                  >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="24px">24px</option>
                  </select>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="image-button"
                    title="Insertar imagen"
                  >
                    🖼️
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={insertImage}
                    className="file-input"
                  />
                </div>
                <div 
                  ref={containerRef}
                  className="editor-container-area"
                  style={{ minHeight: `${containerHeight}px` }}
                >
                  <textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="description-textarea"
                    style={{
                      color: textColor,
                      fontSize: fontSize,
                      textAlign: textAlign,
                      minHeight: `${containerHeight}px`
                    }}
                    placeholder="Describe tu actividad aquí..."
                  />
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="image-container"
                      style={{
                        left: img.x + 'px',
                        top: img.y + 'px',
                        width: img.width + 'px',
                        height: img.height + 'px'
                      }}
                    >
                      <img
                        src={img.src}
                        alt=""
                        className="draggable-image"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const rect = e.currentTarget.parentElement.getBoundingClientRect();
                          const containerRect = containerRef.current.getBoundingClientRect();
                          const startX = e.clientX - rect.left;
                          const startY = e.clientY - rect.top;
                          
                          const handleMouseMove = (e) => {
                            const newX = e.clientX - containerRect.left - startX;
                            const newY = e.clientY - containerRect.top - startY;
                            updateImagePosition(img.id, newX, newY);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="remove-button"
                      >
                        ×
                      </button>
                      <div
                        className="resize-handle"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = img.width;
                          const startHeight = img.height;
                          
                          const handleMouseMove = (e) => {
                            const newWidth = startWidth + (e.clientX - startX);
                            const newHeight = startHeight + (e.clientY - startY);
                            updateImageSize(img.id, newWidth, newHeight);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Pregunta:</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="text-input"
                placeholder="¿Cuál es la pregunta de tu actividad?"
              />
            </div>

            <div className="select-group">
              <div className="select-item">
                <label className="input-label">Rango de edad:</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="select-input"
                >
                  <option value="">Selecciona...</option>
                  <option value="8-10">8-10 años</option>
                  <option value="10-12">10-12 años</option>
                  <option value="12-14">12-14 años</option>
                  <option value="14-16">14-16 años</option>
                  <option value="16-19">16-19 años</option>
                </select>
              </div>

              <div className="select-item">
                <label className="input-label">Dificultad:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="select-input"
                >
                  <option value="">Selecciona...</option>
                  <option value="facil">Fácil</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
            </div>

            <div className="steps-section">
              <h4 className="steps-title">Pasos esperados:</h4>
              <div className="steps-list">
                {steps.map((step, idx) => (
                  <div key={idx} className="step-item">
                    <input
                      placeholder={`Paso ${idx + 1}`}
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      className="step-input"
                    />
                    <button
                      onClick={() => deleteStep(idx)}
                      className="delete-step-button"
                      title="Eliminar paso"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <div className="steps-controls">
                <p className="steps-counter">
                  Pasos agregados: {steps.length} / {difficulty ? limits[difficulty] : '?'}
                </p>
                <button
                  onClick={addStep}
                  className="add-step-button"
                >
                  + Agregar paso
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={startPreview}
                className="preview-button"
              >
                Vista previa
              </button>
            </div>

            {message && (
              <div className="message info-message">
                {message}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <div className="game-container">
            <h2 className="game-title">{title}</h2>
            
            {description && (
              <div className="description-preview" style={{ minHeight: `${containerHeight}px` }}>
                <div
                  style={{ color: textColor, fontSize: fontSize, textAlign: textAlign }}
                  dangerouslySetInnerHTML={{ __html: formatText(description) }}
                />
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="preview-image"
                    style={{
                      left: img.x + 'px',
                      top: img.y + 'px',
                      width: img.width + 'px',
                      height: img.height + 'px'
                    }}
                  >
                    <img
                      src={img.src}
                      alt=""
                      className="preview-img"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {question && (
              <div className="question-box">
                <h3 className="question-text">{question}</h3>
              </div>
            )}

            <div className="game-area">
              <div className="options-section">
                <h4 className="section-title">Opciones disponibles:</h4>
                <div className="options-list">
                  {shuffledSteps.map((step, idx) => (
                    !userAnswers.includes(step) && (
                      <div
                        key={idx}
                        className={`option-item ${gameCompleted ? 'disabled' : 'draggable'}`}
                        draggable={!gameCompleted}
                        onDragStart={(e) => handleDragStart(e, step)}
                      >
                        {step}
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="sequence-section">
                <h4 className="section-title">Tu secuencia:</h4>
                <div className="sequence-list">
                  {userAnswers.map((ans, i) => (
                    <div
                      key={i}
                      className={`sequence-item ${
                        gameCompleted
                          ? (ans === correctSteps[i] ? 'correct' : 'incorrect')
                          : 'empty'
                      }`}
                      onDragOver={!gameCompleted ? handleDragOver : undefined}
                      onDrop={!gameCompleted ? (e) => handleDrop(e, i) : undefined}
                    >
                      {ans ? (
                        <span className="sequence-text">{ans}</span>
                      ) : (
                        <span className="placeholder-text">Paso {i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="game-controls">
              <div className="control-buttons">
                <button
                  onClick={resetPreview}
                  className="back-button"
                >
                  Volver al editor
                </button>
                {!gameCompleted ? (
                  <button
                    onClick={saveSteps}
                    className="save-button"
                  >
                    Guardar pasos
                  </button>
                ) : (
                  <button
                    onClick={resetGame}
                    className="retry-button"
                  >
                    Intentar de nuevo
                  </button>
                )}
                <button
                  onClick={() => setMessage('Actividad guardada con éxito.')}
                  className="save-activity-button"
                >
                  Guardar actividad
                </button>
              </div>
            </div>

            {showFeedback && (
              <div className="feedback-section">
                <h3 className="feedback-title">Retroalimentación</h3>
                <pre className="feedback-content">
                  {feedback}
                </pre>
              </div>
            )}

            {message && (
              <div className={`message ${
                message.includes('guardado') ? 'success-message' :
                message.includes('completa') ? 'warning-message' :
                'info-message'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}