import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Rnd } from 'react-rnd';
import '../styles/ResizableDraggableImage.css';

const ResizableDraggableImage = ({ node, updateAttributes }) => {
  const { src, width, height, x, y, id } = node.attrs;
  const [isDraggable, setIsDraggable] = useState(false);
  const [imgSize, setImgSize] = useState({ width, height });
  const [position, setPosition] = useState({ x, y });

  const containerRef = useRef();

  const toggleDraggable = () => {
    setIsDraggable(prev => !prev);
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const newWidth = ref.style.width;
    const newHeight = ref.style.height;
    setImgSize({ width: newWidth, height: newHeight });
    setPosition(position);
    updateAttributes({
      width: newWidth,
      height: newHeight,
      x: position.x,
      y: position.y,
      id, // aseguramos persistencia del ID
    });
  };

  const handleDragStop = (e, d) => {
    const newPos = { x: d.x, y: d.y };
    setPosition(newPos);
    updateAttributes({
      x: newPos.x,
      y: newPos.y,
      id, // aseguramos persistencia del ID
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...imgSize, [name]: value };
    setImgSize(updated);
    updateAttributes({
      ...updated,
      id, // aseguramos persistencia del ID
    });
  };

  const resetSize = () => {
    const original = { width: '300px', height: 'auto' };
    setImgSize(original);
    updateAttributes({
      ...original,
      id, // aseguramos persistencia del ID
    });
  };

  useEffect(() => {
    setImgSize({ width, height });
    setPosition({ x, y });
  }, [width, height, x, y]);

  return (
    <NodeViewWrapper className="image-node-view">
      <div ref={containerRef} className="image-wrapper">
        <Rnd
          size={imgSize}
          position={position}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          disableDragging={!isDraggable}
          bounds="parent"
        >
          <img
            src={src}
            alt=""
            style={{ width: '100%', height: '100%', display: 'block' }}
            onDoubleClick={toggleDraggable}
            data-id={id}
            data-type="resizableDraggableImage" 
          />
        </Rnd>
      </div>
    </NodeViewWrapper>
  );
};

export default ResizableDraggableImage;