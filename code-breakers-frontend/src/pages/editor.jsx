import React, { useRef, useEffect } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import ImageResize from 'quill-image-resize-module-react'
import 'react-quill/dist/quill.snow.css'
import '../styles/editor.css'

if (typeof window !== 'undefined' && !window.Quill) {
  window.Quill = Quill;
}
Quill.register('modules/imageResize', ImageResize)

export default function Editor({
  title,
  setTitle,
  description,
  setDescription,
  containerHeight,
  question,
  setQuestion,
  ageGroup,
  setAgeGroup,
  difficulty,
  setDifficulty,
  steps,
  setSteps,
  handleStepChange,
  deleteStep,
  addStep,
  limits,
  startPreview,
  saveActivity,
  resetForm,
  message,
  setMessage,
  images,
  setImages,
  isLoading = false,
  isSaving = false,
}) {
  const quillRef = useRef(null)

  const handleQuillChange = (value) => {
    setDescription(value)
    extractImagesFromHTML(value)
  }

  const extractImagesFromHTML = async (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imageElements = doc.querySelectorAll('img');

    const extractedImages = [];

    for (let i = 0; i < imageElements.length; i++) {
      const img = imageElements[i];
      const style = img.getAttribute('style') || '';
      const widthMatch = style.match(/width:\s*(\d+\.?\d*)px/);
      const heightMatch = style.match(/height:\s*(\d+\.?\d*)px/);

      let imageSrc = img.src;

      // Si es Base64 y muy grande, comprimir
      if (imageSrc.startsWith('data:image')) {
        const sizeInBytes = (imageSrc.split(',')[1].length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        if (sizeInMB > 1) { // Comprimir si es mayor a 1MB
          try {
            imageSrc = await compressImage(imageSrc, 600, 400, 0.8);
            console.log(`Imagen comprimida de ${sizeInMB.toFixed(2)}MB`);
          } catch (error) {
            console.error('Error comprimiendo imagen:', error);
          }
        }
      }

      extractedImages.push({
        id: img.getAttribute('data-id') || `quill-img-${Date.now()}-${i}`,
        src: imageSrc,
        width: widthMatch ? parseFloat(widthMatch[1]) : img.width || 300,
        height: heightMatch ? parseFloat(heightMatch[1]) : img.height || 200,
        x: 0,
        y: 0,
      });
    }

    setImages(extractedImages);
  };

  // Función para validar todos los campos obligatorios
  const validateForm = () => {
    if (!title.trim()) {
      setMessage('Por favor, ingresa un título.');
      return false;
    }
    if (!description.trim()) {
      setMessage('Por favor, ingresa una descripción.');
      return false;
    }
    if (!question.trim()) {
      setMessage('Por favor, ingresa la pregunta.');
      return false;
    }
    if (!ageGroup) {
      setMessage('Selecciona un rango de edad.');
      return false;
    }
    if (!difficulty) {
      setMessage('Selecciona una dificultad.');
      return false;
    }
    if (steps.length === 0 || steps.some(step => step.trim() === '')) {
      setMessage('Todos los pasos deben estar completos.');
      return false;
    }

    setMessage('');
    return true;
  };

  const handlePreviewClick = () => {
    if (validateForm()) {
      startPreview();
    }
  };

  const handleSaveClick = async () => {
    if (validateForm()) {
      await saveActivity();
    }
  };

  const handleResetClick = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear todos los campos? Se perderán todos los datos no guardados.')) {
      resetForm();
    }
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }, { 'size': [] }],
      [{ 'align': [] }],
      ['image'],
    ],
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
    }
  }

  const formats = [
    'bold', 'italic', 'underline',
    'color', 'background',
    'font', 'size',
    'align', 'image'
  ]

  useEffect(() => {
    if (typeof description === "string" && description.trim()) {
      extractImagesFromHTML(description)
    }
  }, [])

  return (
    <div className="editor-container">
      <div className="input-group">
        <label className="input-label">Título de la actividad:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (message) setMessage('')
          }}
          className="text-input"
          placeholder="Ingresa un título"
          disabled={isLoading || isSaving}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Descripción:</label>
        <div className="description-editor" style={{ minHeight: containerHeight }}>
          <ReactQuill
            ref={quillRef}
            value={description || ""}
            onChange={handleQuillChange}
            modules={modules}
            formats={formats}
            readOnly={isLoading || isSaving}
          />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Pregunta:</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="text-input"
          placeholder="Escribe la pregunta que guía la actividad"
          rows={2}
          disabled={isLoading || isSaving}
        />
      </div>

      <div className="select-group">
        <div className="select-item">
          <label className="input-label">Rango de edad:</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="select-input"
            disabled={isLoading || isSaving}
          >
            <option value="">-- Selecciona --</option>
            <option value="3-6">3-6 años</option>
            <option value="7-10">7-10 años</option>
            <option value="11-15">11-15 años</option>
          </select>
        </div>

        <div className="select-item">
          <label className="input-label">Dificultad:</label>
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value)
              setSteps([])
              setMessage('')
            }}
            className="select-input"
            disabled={isLoading || isSaving}
          >
            <option value="">-- Selecciona --</option>
            <option value="facil">Fácil (máx {limits.facil} pasos)</option>
            <option value="intermedio">Intermedio (máx {limits.intermedio} pasos)</option>
            <option value="dificil">Difícil (máx {limits.dificil} pasos)</option>
          </select>
        </div>
      </div>

      <div className="steps-section">
        <div className="steps-title">Pasos de la actividad</div>
        <div className="steps-list">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <span className="step-number">{index + 1}</span>
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                className="step-input"
                placeholder={`Describe el paso ${index + 1}`}
                rows={2}
                disabled={isLoading || isSaving}
              />
              <button
                type="button"
                onClick={() => deleteStep(index)}
                className="delete-step-button"
                disabled={isLoading || isSaving}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="steps-controls">
          <p className="steps-counter">
            {steps.length} de {difficulty ? limits[difficulty] : '-'} pasos
          </p>
          <button
            type="button"
            onClick={addStep}
            disabled={!difficulty || steps.length >= limits[difficulty] || isLoading || isSaving}
            className="add-step-button"
          >
            + Agregar paso
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('exitosamente') || message.includes('éxito') ? 'success-message' : 'error-message'}`}>
          {isLoading && '⏳ '}{isSaving && '💾 '}{message}
        </div>
      )}

      <div className="buttons-container">
        <button
          type="button"
          onClick={handlePreviewClick}
          className="preview-button"
          disabled={isLoading || isSaving}
        >
          {isLoading ? '⏳ Validando...' : '👁️ Vista Previa'}
        </button>

        <button
          type="button"
          onClick={handleSaveClick}
          className="save-activity-button"
          disabled={isLoading || isSaving}
        >
          {isSaving ? '💾 Guardando...' : '💾 Guardar actividad'}
        </button>

        <button
          type="button"
          onClick={handleResetClick}
          className="reset-button"
          disabled={isLoading || isSaving}
        >
          🔄 Resetear
        </button>
      </div>
    </div>
  )
}