import { Image } from '@tiptap/extension-image'

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '300px',
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: 'auto',
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          return {
            height: attributes.height,
          }
        },
      },
    }
  },
})
