import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableDraggableImage from '../ResizableDraggableImage'
export const ResizableDraggableImageExtension = Node.create({
  name: 'resizableDraggableImage',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '300px' },
      height: { default: 'auto' },
      x: { default: 0 },
      y: { default: 0 },
      'data-id': { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-type="resizableDraggableImage"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'resizableDraggableImage',
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableDraggableImage)
  },
})
