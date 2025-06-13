import React from 'react';

export default function editor({
  description,
  setDescription,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  textAlign,
  setTextAlign,
  textColor,
  setTextColor,
  fontSize,
  setFontSize,
  descriptionRef,
  fileInputRef,
  insertImage
}) {
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
          formattedText = `**${selectedText}**`;
          setIsBold(!isBold);
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          setIsItalic(!isItalic);
          break;
        default:
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

  return (
    <div className="input-group">
      <label className="input-label">Descripción:</label>
      <div className="toolbar">
        <button onClick={() => applyFormatting('bold')} className={`toolbar-button ${isBold ? 'active' : ''}`} title="Negrita">
          <strong>B</strong>
        </button>
        <button onClick={() => applyFormatting('italic')} className={`toolbar-button ${isItalic ? 'active' : ''}`} title="Cursiva">
          <em>I</em>
        </button>
        <select value={textAlign} onChange={(e) => setTextAlign(e.target.value)} className="toolbar-select">
          <option value="left">← Izq</option>
          <option value="center">↔ Centro</option>
          <option value="right">→ Der</option>
        </select>
        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="color-input" title="Color del texto" />
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="toolbar-select">
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
        </select>
        <button onClick={() => fileInputRef.current?.click()} className="image-button" title="Insertar imagen">🖼️</button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={insertImage} className="file-input" style={{ display: 'none' }} />
      </div>

      <textarea
        ref={descriptionRef}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="description-textarea"
        style={{
          color: textColor,
          fontSize: fontSize,
          textAlign: textAlign,
          minHeight: '200px',
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
        placeholder="Describe tu actividad aquí..."
      />
    </div>
  );
}
