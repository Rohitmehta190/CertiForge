"use client";

import { useState, useRef, useEffect } from "react";

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  position: { x: number; y: number };
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    width?: number;
    height?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  elements: TemplateElement[];
}

export default function TemplateBuilder() {
  const [template, setTemplate] = useState<Template>({
    id: '',
    name: 'My Custom Template',
    description: 'A custom certificate template',
    canvas: {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    },
    elements: []
  });

  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add text element
  const addTextElement = () => {
    const newElement: TemplateElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Certificate of Achievement',
      position: { x: 50, y: 50 },
      style: {
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 300,
        height: 50
      }
    };

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
    setSelectedElement(newElement);
  };

  // Add image element
  const addImageElement = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newElement: TemplateElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          content: e.target?.result as string,
          position: { x: 100, y: 100 },
          style: {
            width: 200,
            height: 150,
            borderWidth: 0,
            borderRadius: 8
          }
        };

        setTemplate(prev => ({
          ...prev,
          elements: [...prev.elements, newElement]
        }));
        setSelectedElement(newElement);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add shape element
  const addShapeElement = (shapeType: 'rectangle' | 'circle') => {
    const newElement: TemplateElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: shapeType,
      position: { x: 200, y: 200 },
      style: {
        width: shapeType === 'circle' ? 100 : 150,
        height: shapeType === 'circle' ? 100 : 100,
        backgroundColor: '#f0f0f0',
        borderColor: '#cccccc',
        borderWidth: 2,
        borderRadius: shapeType === 'circle' ? 50 : 8
      }
    };

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
    setSelectedElement(newElement);
  };

  // Handle element selection
  const handleElementClick = (element: TemplateElement, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(element);
  };

  // Handle drag start
  const handleDragStart = (element: TemplateElement, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(element);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left - element.position.x,
        y: event.clientY - rect.top - element.position.y
      });
    }
  };

  // Handle drag move
  const handleDragMove = (event: React.MouseEvent) => {
    if (isDragging && selectedElement) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = event.clientX - rect.left - dragOffset.x;
        const newY = event.clientY - rect.top - dragOffset.y;

        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el => 
            el.id === selectedElement.id 
              ? { ...el, position: { x: newX, y: newY } }
              : el
          )
        }));
      }
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Update element style
  const updateElementStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === selectedElement.id 
          ? { ...el, style: { ...el.style, [property]: value } }
          : el
      )
    }));

    setSelectedElement(prev => 
      prev ? { ...prev, style: { ...prev.style, [property]: value } } : null
    );
  };

  // Update element content
  const updateElementContent = (content: string) => {
    if (!selectedElement) return;

    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === selectedElement.id 
          ? { ...el, content }
          : el
      )
    }));

    setSelectedElement(prev => 
      prev ? { ...prev, content } : null
    );
  };

  // Delete element
  const deleteElement = () => {
    if (!selectedElement) return;

    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== selectedElement.id)
    }));
    setSelectedElement(null);
  };

  // Save template
  const saveTemplate = () => {
    const templateToSave = {
      ...template,
      id: template.id || `custom-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage for now (later: Firebase)
    const savedTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
    savedTemplates.push(templateToSave);
    localStorage.setItem('customTemplates', JSON.stringify(savedTemplates));

    alert('Template saved successfully!');
  };

  // Render element
  const renderElement = (element: TemplateElement) => {
    const isSelected = selectedElement?.id === element.id;

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.style.width}px`,
              height: `${element.style.height}px`,
              fontSize: `${element.style.fontSize}px`,
              fontFamily: element.style.fontFamily,
              color: element.style.color,
              fontWeight: element.style.fontWeight,
              textAlign: element.style.textAlign,
              border: isSelected ? '2px solid #3b82f6' : 'none',
              padding: '4px'
            }}
            onClick={(e) => handleElementClick(element, e)}
            onMouseDown={(e) => handleDragStart(element, e)}
          >
            {element.content}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.style.width}px`,
              height: `${element.style.height}px`,
              border: isSelected ? '2px solid #3b82f6' : 'none',
              borderRadius: `${element.style.borderRadius}px`,
              overflow: 'hidden'
            }}
            onClick={(e) => handleElementClick(element, e)}
            onMouseDown={(e) => handleDragStart(element, e)}
          >
            <img 
              src={element.content} 
              alt="Template element" 
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'shape':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.style.width}px`,
              height: `${element.style.height}px`,
              backgroundColor: element.style.backgroundColor,
              border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
              borderRadius: `${element.style.borderRadius}px`,
              borderStyle: 'solid'
            }}
            onClick={(e) => handleElementClick(element, e)}
            onMouseDown={(e) => handleDragStart(element, e)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="flex h-screen">
        {/* Sidebar - Tools */}
        <div className="w-64 bg-zinc-800 p-4 border-r border-zinc-700">
          <h2 className="text-xl font-bold mb-6">Template Builder</h2>
          
          {/* Template Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
            />
          </div>

          {/* Canvas Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Canvas Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Width</label>
                <input
                  type="number"
                  value={template.canvas.width}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    canvas: { ...prev.canvas, width: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Height</label>
                <input
                  type="number"
                  value={template.canvas.height}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    canvas: { ...prev.canvas, height: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Background</label>
                <input
                  type="color"
                  value={template.canvas.backgroundColor}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    canvas: { ...prev.canvas, backgroundColor: e.target.value }
                  }))}
                  className="w-full h-10 bg-zinc-700 border border-zinc-600 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Elements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Add Elements</h3>
            <div className="space-y-2">
              <button
                onClick={addTextElement}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Text
              </button>
              
              <label className="block">
                <span className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer block text-center">
                  Add Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={addImageElement}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={() => addShapeElement('rectangle')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Rectangle
              </button>
              
              <button
                onClick={() => addShapeElement('circle')}
                className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Add Circle
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={saveTemplate}
              className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
            >
              Save Template
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Canvas</h2>
              <div className="text-sm text-zinc-400">
                {template.canvas.width} × {template.canvas.height}px
              </div>
            </div>
            
            <div 
              ref={canvasRef}
              className="relative bg-white mx-auto"
              style={{
                width: `${template.canvas.width}px`,
                height: `${template.canvas.height}px`,
                backgroundColor: template.canvas.backgroundColor
              }}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {template.elements.map(renderElement)}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-zinc-800 p-4 border-l border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            
            {selectedElement ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <div className="px-3 py-2 bg-zinc-700 rounded-lg capitalize">
                    {selectedElement.type}
                  </div>
                </div>

                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Text Content</label>
                      <textarea
                        value={selectedElement.content}
                        onChange={(e) => updateElementContent(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Font Size</label>
                      <input
                        type="number"
                        value={selectedElement.style.fontSize}
                        onChange={(e) => updateElementStyle('fontSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Font Family</label>
                      <select
                        value={selectedElement.style.fontFamily}
                        onChange={(e) => updateElementStyle('fontFamily', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.style.color}
                        onChange={(e) => updateElementStyle('color', e.target.value)}
                        className="w-full h-10 bg-zinc-700 border border-zinc-600 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Font Weight</label>
                      <select
                        value={selectedElement.style.fontWeight}
                        onChange={(e) => updateElementStyle('fontWeight', e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </>
                )}

                {(selectedElement.type === 'image' || selectedElement.type === 'shape') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Width</label>
                      <input
                        type="number"
                        value={selectedElement.style.width}
                        onChange={(e) => updateElementStyle('width', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Height</label>
                      <input
                        type="number"
                        value={selectedElement.style.height}
                        onChange={(e) => updateElementStyle('height', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>
                  </>
                )}

                {selectedElement.type === 'shape' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Background Color</label>
                      <input
                        type="color"
                        value={selectedElement.style.backgroundColor}
                        onChange={(e) => updateElementStyle('backgroundColor', e.target.value)}
                        className="w-full h-10 bg-zinc-700 border border-zinc-600 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Border Color</label>
                      <input
                        type="color"
                        value={selectedElement.style.borderColor}
                        onChange={(e) => updateElementStyle('borderColor', e.target.value)}
                        className="w-full h-10 bg-zinc-700 border border-zinc-600 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Border Width</label>
                      <input
                        type="number"
                        value={selectedElement.style.borderWidth}
                        onChange={(e) => updateElementStyle('borderWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Position X</label>
                  <input
                    type="number"
                    value={selectedElement.position.x}
                    onChange={(e) => {
                      const newX = parseInt(e.target.value);
                      setTemplate(prev => ({
                        ...prev,
                        elements: prev.elements.map(el => 
                          el.id === selectedElement.id 
                            ? { ...el, position: { ...el.position, x: newX } }
                            : el
                        )
                      }));
                      setSelectedElement(prev => 
                        prev ? { ...prev, position: { ...prev.position, x: newX } } : null
                      );
                    }}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Position Y</label>
                  <input
                    type="number"
                    value={selectedElement.position.y}
                    onChange={(e) => {
                      const newY = parseInt(e.target.value);
                      setTemplate(prev => ({
                        ...prev,
                        elements: prev.elements.map(el => 
                          el.id === selectedElement.id 
                            ? { ...el, position: { ...el.position, y: newY } }
                            : el
                        )
                      }));
                      setSelectedElement(prev => 
                        prev ? { ...prev, position: { ...prev.position, y: newY } } : null
                      );
                    }}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                  />
                </div>

                <button
                  onClick={deleteElement}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Element
                </button>
              </div>
            ) : (
              <div className="text-zinc-400 text-center py-8">
                Select an element to edit its properties
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
