// JSX FILE: DocenteActividad.jsx
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { FontSize } from '../extensions/FontSize';
import '../styles/crearJuego.css';

export default function DocenteActividad() {
  const [title, setTitle] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [steps, setSteps] = useState(['']);
  const [background, setBackground] = useState(null);
  const [correctSteps, setCorrectSteps] = useState([]);
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [message, setMessage] = useState('');

  const limits = { facil: 6, intermedio: 8, dificil: 10 };
  const maxErrors = { facil: Infinity, intermedio: 3, dificil: 1 };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
    ],
    content: '<p></p>',
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBackground(URL.createObjectURL(file));
  };

  const insertEditorImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file);
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
    setAnswers(new Array(filtered.length).fill(null));
    setCurrentStep(0);
    setDragItem(null);
    setTotalErrors(0);
    setGameOver(false);
    setIsPreview(true);
    setMessage('');
  };

  const resetPreview = () => {
    setIsPreview(false);
    setAnswers([]);
    setDragItem(null);
    setTotalErrors(0);
    setGameOver(false);
    setCurrentStep(0);
    setMessage('');
  };

  const handleDragStart = (item) => {
    if (!gameOver) {
      setDragItem(item);
      setMessage('');
    }
  };

  const handleDrop = (index) => {
    if (gameOver) return;
    if (dragItem && index === currentStep) {
      if (dragItem === correctSteps[currentStep]) {
        const newAnswers = [...answers];
        newAnswers[index] = dragItem;
        setAnswers(newAnswers);
        setCurrentStep(currentStep + 1);
        if (currentStep + 1 === correctSteps.length) {
          setMessage('¡Felicidades, lo lograste!');
        }
      } else {
        const newErrors = totalErrors + 1;
        setTotalErrors(newErrors);
        if (newErrors >= maxErrors[difficulty]) {
          setGameOver(true);
          setMessage('Has alcanzado el límite de errores. Fin del juego.');
        } else {
          setMessage(`Incorrecto. Te quedan ${maxErrors[difficulty] - newErrors} error(es).`);
        }
      }
      setDragItem(null);
    } else {
      setMessage('Debes seguir el orden correcto.');
    }
  };

  return (
    <div className="actividad-container">
      {!isPreview ? (
        <div className="editor">
          <h2>Crear nueva actividad</h2>

          <label>Título:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label>Descripción:</label>
          <div className="toolbar">
            <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>←</button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>↔</button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>→</button>
            <input type="color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
            <select onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}>
              <option value="12px">12</option>
              <option value="14px">14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
              <option value="24px">24</option>
            </select>
            <label className="image-upload">
              🖼️
              <input type="file" accept="image/*" onChange={insertEditorImage} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="editor-box" onClick={() => editor.commands.focus()}>
            <EditorContent editor={editor} />
          </div>

          <label>Imagen de fondo:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          <label>Rango de edad:</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
            <option value="">Selecciona...</option>
            <option value="8-10">8-10</option>
            <option value="10-12">10-12</option>
            <option value="12-14">12-14</option>
            <option value="14-16">14-16</option>
            <option value="16-19">16-19</option>
          </select>

          <label>Dificultad:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">Selecciona...</option>
            <option value="facil">Fácil</option>
            <option value="intermedio">Intermedio</option>
            <option value="dificil">Difícil</option>
          </select>

          <h4>Pasos esperados:</h4>
          {steps.map((step, idx) => (
            <div key={idx} className="step-row">
              <input
                placeholder={`Paso ${idx + 1}`}
                value={step}
                onChange={(e) => handleStepChange(idx, e.target.value)}
              />
              <button onClick={() => deleteStep(idx)}>🗑️</button>
            </div>
          ))}
          <p>Pasos agregados: {steps.length} / {difficulty ? limits[difficulty] : '?'}</p>
          <button className="add-step" onClick={addStep}>+ Agregar paso</button>

          <div className="editor-buttons">
            <button onClick={startPreview}>Vista previa del juego</button>
          </div>

          {message && <div className="message">{message}</div>}
        </div>
      ) : (
        <div className="preview" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
          <div className="overlay">
            <h2>{title}</h2>
            <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            <div className="interactive-columns">
              <div className="draggable-items">
                {shuffledSteps.map((step, idx) => (
                  !answers.includes(step) && (
                    <div key={idx} className="draggable" draggable onDragStart={() => handleDragStart(step)}>
                      {step}
                    </div>
                  )
                ))}
              </div>
              <div className="drop-zones">
                {answers.map((ans, i) => (
                  <div
                    key={i}
                    className={`drop-slot ${i === currentStep ? 'active-slot' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                  >
                    {ans ? <span>{ans}</span> : <span className="placeholder">Suelta aquí</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="preview-buttons">
              <button onClick={resetPreview}>Volver al editor</button>
              <button onClick={() => setMessage('Actividad guardada con éxito.')}>Guardar</button>
            </div>
            {message && <div className="message">{message}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
