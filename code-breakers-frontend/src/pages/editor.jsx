
import React, { useRef, useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import { FontSize, TextColor } from '../components/extensions/TextStyleExtensions'
import { ResizableDraggableImageExtension } from '../components/extensions/ResizableDraggableImageExtension'
import '../styles/editor.css'

export default function Editor({
  title,
  setTitle,
  description,
  setDescription,
  textColor,
  setTextColor,
  fontSize,
  setFontSize,
  fontWeight,
  setFontWeight,
  fontStyle,
  setFontStyle,
  textDecoration,
  setTextDecoration,
  textAlign,
  setTextAlign,
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
  message,
  setMessage,
  images,
  setImages,
}) {
  const fileInputRef = useRef(null)
  const [lastImageAttrs, setLastImageAttrs] = useState(null)
  const [isUpdatingImages, setIsUpdatingImages] = useState(false)

  const tiptapEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      TextColor,
      ResizableDraggableImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: description,
    onUpdate({ editor }) {
      const newDescription = editor.getHTML()
      setDescription(newDescription)

      // Extraer imágenes del HTML y sincronizar con el estado
      if (!isUpdatingImages) {
        extractImagesFromHTML(newDescription)
      }
    },
  })

  // Función SIMPLIFICADA para extraer imágenes del HTML
  const extractImagesFromHTML = (htmlContent) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      const imageElements = doc.querySelectorAll('img[data-type="resizableDraggableImage"]')

      console.log('🔍 Extrayendo imágenes del HTML:', imageElements.length)

      const extractedImages = Array.from(imageElements).map((img, index) => {
        const imageId = img.getAttribute('data-id') || `tiptap-img-${Date.now()}-${index}`

        // Simplificar la obtención de dimensiones
        const width = parseInt(img.getAttribute('data-width')) || 300
        const height = parseInt(img.getAttribute('data-height')) || 200
        const x = parseInt(img.getAttribute('data-x')) || 0
        const y = parseInt(img.getAttribute('data-y')) || 0

        return {
          id: imageId,
          src: img.src,
          width: width,
          height: height,
          x: x,
          y: y,
        }
      })

      // Solo actualizar si hay cambios significativos
      setImages(prevImages => {
        const hasSignificantChanges = extractedImages.length !== prevImages.length ||
          extractedImages.some((newImg) => {
            const existingImg = prevImages.find(img => img.id === newImg.id)
            return !existingImg ||
              existingImg.src !== newImg.src ||
              Math.abs(existingImg.width - newImg.width) > 5 ||
              Math.abs(existingImg.height - newImg.height) > 5
          })

        if (hasSignificantChanges) {
          console.log('🔄 Actualizando estado de imágenes:', extractedImages)
          return extractedImages
        }

        return prevImages
      })
    } catch (error) {
      console.error('❌ Error al extraer imágenes:', error)
    }
  }

  // Función SIMPLIFICADA para redimensionar imagen
  const resizeLastImage = (newWidth, newHeight) => {
    if (!tiptapEditor || !lastImageAttrs) return

    const numericWidth = parseInt(newWidth) || 300
    const numericHeight = parseInt(newHeight) || 200

    console.log('🔄 Redimensionando imagen:', { id: lastImageAttrs.id, width: numericWidth, height: numericHeight })

    // Buscar y actualizar el nodo en el editor
    tiptapEditor.commands.command(({ tr, state }) => {
      let nodePos = -1

      state.doc.descendants((node, pos) => {
        if (node.type.name === 'resizableDraggableImage' &&
          node.attrs['data-id'] === lastImageAttrs.id) {
          nodePos = pos
          return false // Detener búsqueda
        }
      })

      if (nodePos === -1) return false

      tr.setNodeMarkup(nodePos, undefined, {
        ...state.doc.nodeAt(nodePos).attrs,
        width: numericWidth,
        height: numericHeight,
      })

      return true
    })

    const updatedAttrs = {
      ...lastImageAttrs,
      width: numericWidth,
      height: numericHeight
    }

    setLastImageAttrs(updatedAttrs)

    // Actualizar estado de imágenes
    setImages(prev => prev.map(img =>
      img.id === lastImageAttrs.id ? updatedAttrs : img
    ))
  }

  // Función mejorada para insertar imagen (ÚNICA VERSIÓN - CORREGIDA)
  const insertImageFromFile = (event) => {
    const file = event.target.files[0]
    if (!file || !tiptapEditor) return

    const reader = new FileReader()
    reader.onload = () => {
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      console.log('📤 Insertando nueva imagen con ID:', imageId)

      setIsUpdatingImages(true)

      tiptapEditor
        .chain()
        .focus()
        .insertContent({
          type: 'resizableDraggableImage',
          attrs: {
            src: reader.result,
            width: 300,
            height: 'auto',
            x: 0,
            y: 0,
            'data-id': imageId,
            'data-type': 'resizableDraggableImage'
          },
        })
        .run()

      const newImageAttrs = {
        id: imageId,
        src: reader.result,
        width: 300,
        height: 'auto',
        x: 0,
        y: 0
      }

      setLastImageAttrs(newImageAttrs)

      // Agregar la imagen al estado inmediatamente
      setImages(prev => {
        const updated = [...prev, newImageAttrs]
        console.log('✅ Estado de imágenes actualizado:', updated)
        return updated
      })

      setTimeout(() => {
        setIsUpdatingImages(false)
      }, 500)
    }

    reader.readAsDataURL(file)

    // Limpiar el input para permitir seleccionar el mismo archivo
    event.target.value = ''
  }

  // Efecto para sincronizar imágenes cuando se monta el componente o cambia la descripción
  useEffect(() => {
    if (description && tiptapEditor && !isUpdatingImages) {
      console.log('🔄 Sincronizando imágenes del HTML existente')
      extractImagesFromHTML(description)
    }
  }, [description, tiptapEditor])

  // Efecto para debug - mostrar estado actual de imágenes
  useEffect(() => {
    console.log('📊 Estado actual de imágenes:', images.length, images)
  }, [images])

  // Componente de controles de imagen
  const ImageControls = () => {
    if (!lastImageAttrs) return null
  }

  // Función para aplicar estilos al contenido del editor
  const applyGlobalStyles = () => {
    if (!tiptapEditor) return

    const editorElement = document.querySelector('.ProseMirror')
    if (editorElement) {
      editorElement.style.color = textColor
      editorElement.style.fontSize = fontSize
      editorElement.style.fontWeight = fontWeight
      editorElement.style.fontStyle = fontStyle
      editorElement.style.textDecoration = textDecoration
    }
  }

  // Aplicar estilos cuando cambien
  React.useEffect(() => {
    applyGlobalStyles()
  }, [textColor, fontSize, fontWeight, fontStyle, textDecoration, tiptapEditor])

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
        />
      </div>

      <div className="input-group">
        <label className="input-label">Descripción:</label>

        <div
          className="description-editor"
          style={{ minHeight: containerHeight }}
        >
          <div className="toolbar">
            <button
              className={`toolbar-button ${tiptapEditor?.isActive('bold') ? 'active' : ''}`}
              onClick={() => tiptapEditor?.chain().focus().toggleBold().run()}
            >
              <strong>B</strong>
            </button>
            <button
              className={`toolbar-button ${tiptapEditor?.isActive('italic') ? 'active' : ''}`}
              onClick={() => tiptapEditor?.chain().focus().toggleItalic().run()}
            >
              <em>I</em>
            </button>
            <button
              className={`toolbar-button ${tiptapEditor?.isActive('underline') ? 'active' : ''}`}
              onClick={() => tiptapEditor?.chain().focus().toggleUnderline?.().run()}
            >
              <u>U</u>
            </button>

            <div className="toolbar-separator"></div>

            <label className="toolbar-label">Color:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                const color = e.target.value
                setTextColor(color)
                tiptapEditor?.chain().focus().setTextColor(color).run()
              }}
            />

            <label className="toolbar-label">Tamaño:</label>
            <select
              value={fontSize}
              onChange={(e) => {
                const size = e.target.value
                setFontSize(size)
                tiptapEditor?.chain().focus().setFontSize(size).run()
              }}
            >
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
            </select>

            <div className="toolbar-separator"></div>

            <button
              className={`toolbar-button ${tiptapEditor?.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
              onClick={() => tiptapEditor?.chain().focus().setTextAlign('left').run()}
              title="Alinear a la izquierda"
            >
              ⬅
            </button>
            <button
              className={`toolbar-button ${tiptapEditor?.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
              onClick={() => tiptapEditor?.chain().focus().setTextAlign('center').run()}
              title="Centrar"
            >
              ⬌
            </button>
            <button
              className={`toolbar-button ${tiptapEditor?.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
              onClick={() => tiptapEditor?.chain().focus().setTextAlign('right').run()}
              title="Alinear a la derecha"
            >
              ➡
            </button>

            <div className="toolbar-separator"></div>

            <input
              type="file"
              accept="image/*"
              onChange={insertImageFromFile}
              ref={fileInputRef}
              className="file-input"
            />
            <button
              type="button"
              className="image-button"
              onClick={() => fileInputRef.current?.click()}
              title="Insertar imagen"
            >
              🖼️
            </button>
          </div>

          <ImageControls />

          <div className="editor-container-area">
            <EditorContent
              editor={tiptapEditor}
            />
          </div>
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
          >
            <option value="">-- Selecciona --</option>
            <option value="facil">Fácil (máx {limits.facil} pasos)</option>
            <option value="intermedio">Intermedio (máx {limits.intermedio} pasos)</option>
            <option value="dificil">Difícil (máx {limits.dificil} pasos)</option>
          </select>
        </div>
      </div>

      <div className="steps-section">
        <div className="steps-title">
          Pasos de la actividad
        </div>

        <div className="steps-list">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <span className="step-number">
                {index + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                className="step-input"
                placeholder={`Describe el paso ${index + 1}`}
                rows={2}
              />
              <button
                type="button"
                onClick={() => deleteStep(index)}
                className="delete-step-button"
                title="Eliminar paso"
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
            disabled={!difficulty || steps.length >= limits[difficulty]}
            className="add-step-button"
          >
            + Agregar paso
          </button>
        </div>
      </div>

      {message && (
        <div className="error-message">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={startPreview}
        className="preview-button"
      >
        Vista Previa 👁️
      </button>
    </div>
  )
}