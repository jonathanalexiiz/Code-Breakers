// Editor.jsx
import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { FontSize } from './extensions/FontSize'
import '../styles/editor.css';

const MenuBar = ({ editor }) => {
  if (!editor) return null

  return (
    <div className="toolbar">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>

      <input
        type="color"
        onChange={e => editor.chain().focus().setColor(e.target.value).run()}
        title="Color de texto"
      />

      <select
        onChange={e => editor.chain().focus().setFontSize(e.target.value).run()}
        defaultValue=""
      >
        <option value="" disabled>
          Tamaño
        </option>
        <option value="12">12px</option>
        <option value="16">16px</option>
        <option value="20">20px</option>
        <option value="24">24px</option>
        <option value="32">32px</option>
      </select>
    </div>
  )
}

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],
    content: '<p>Texto de ejemplo</p>',
  })

  return (
    <div className="editor-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}

export default Editor
