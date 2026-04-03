"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FirebaseService } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { 
  Type, Image as ImageIcon, Square, Circle, Save, Pointer,
  Move, Minimize2, BringToFront, SendToBack, Copy, Trash2,
  ZoomIn, ZoomOut, Check, AlignLeft, AlignCenter, AlignRight,
  MousePointer2, Upload
} from "lucide-react";

interface Position { x: number; y: number }
interface Size { width: number; height: number }

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string; // text content, image data url, or shape type String
  position: Position;
  size: Size;
  zIndex: number;
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    opacity?: number;
  };
}

export interface Template {
  id?: string;
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
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [template, setTemplate] = useState<Template>({
    name: 'Untitled Masterpiece',
    description: 'Custom certificate design',
    canvas: { width: 1123, height: 794, backgroundColor: '#ffffff' }, // A4 landscape
    elements: []
  });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<Template[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectedElement = template.elements.find(e => e.id === selectedId) || null;

  // Save to history (debounced)
  const saveStateToHistory = useCallback((newState: Template) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newState];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Initial load
  useEffect(() => {
    if (history.length === 0) saveStateToHistory(template);
  }, []);

  const snap = (val: number) => snapToGrid ? Math.round(val / gridSize) * gridSize : val;

  // Add Element Generic
  const addElement = (type: 'text' | 'image' | 'shape', content: string, initialSize: Size, additionalStyles = {}) => {
    const newElement: TemplateElement = {
      id: `${type}-${Date.now()}`,
      type,
      content,
      position: { x: template.canvas.width / 2 - initialSize.width / 2, y: template.canvas.height / 2 - initialSize.height / 2 },
      size: initialSize,
      zIndex: template.elements.length + 1,
      style: { opacity: 1, ...additionalStyles }
    };

    const newTemplate = { ...template, elements: [...template.elements, newElement] };
    setTemplate(newTemplate);
    setSelectedId(newElement.id);
    saveStateToHistory(newTemplate);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          addElement('image', ev.target.result as string, { width: 300, height: 200 }, { borderRadius: 0 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Interactions
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const element = template.elements.find(el => el.id === id);
    if (!element || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate exact offset relative to the un-zoomed element
    const x = (e.clientX - rect.left) / zoom - element.position.x;
    const y = (e.clientY - rect.top) / zoom - element.position.y;
    
    setDragOffset({ x, y });
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom - dragOffset.x;
      const rawY = (e.clientY - rect.top) / zoom - dragOffset.y;
      
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el => 
          el.id === selectedId 
            ? { ...el, position: { x: Math.max(0, snap(rawX)), y: Math.max(0, snap(rawY)) } } 
            : el
        )
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      saveStateToHistory(template);
    }
    setIsDragging(false);
    setIsResizing(null);
  };

  // Styles Update
  const updateStyle = (key: string, value: any) => {
    if (!selectedId) return;
    setTemplate(prev => {
      const newTemplate = {
        ...prev,
        elements: prev.elements.map(el => 
          el.id === selectedId 
            ? { ...el, style: { ...el.style, [key]: value } }
            : el
        )
      };
      saveStateToHistory(newTemplate);
      return newTemplate;
    });
  };

  const updateContent = (content: string) => {
    if (!selectedId) return;
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === selectedId ? { ...el, content } : el)
    }));
  };

  // Layers
  const bringForward = () => {
    if(!selectedElement) return;
    setTemplate(prev => {
      const els = [...prev.elements];
      const idx = els.findIndex(e => e.id === selectedId);
      if(idx < els.length - 1) {
        [els[idx], els[idx+1]] = [els[idx+1], els[idx]];
        els[idx].zIndex = idx;
        els[idx+1].zIndex = idx+1;
      }
      return { ...prev, elements: els };
    });
  };

  const sendBackward = () => {
    if(!selectedElement) return;
    setTemplate(prev => {
      const els = [...prev.elements];
      const idx = els.findIndex(e => e.id === selectedId);
      if(idx > 0) {
        [els[idx], els[idx-1]] = [els[idx-1], els[idx]];
        els[idx].zIndex = idx;
        els[idx-1].zIndex = idx-1;
      }
      return { ...prev, elements: els };
    });
  };

  const deleteElement = () => {
    if (!selectedId) return;
    setTemplate(prev => {
      const newTemplate = { ...prev, elements: prev.elements.filter(e => e.id !== selectedId) };
      saveStateToHistory(newTemplate);
      return newTemplate;
    });
    setSelectedId(null);
  };

  // Database Save
  const saveToDatabase = async () => {
    if (!user) {
      showToast("You must be logged in to save templates", "error");
      return;
    }
    try {
      showToast("Saving template...", "info");
      // Format template strictly for Firebase
      const payload = {
        name: template.name,
        description: template.description || "Custom template",
        isPublic: false,
        // Since we changed Firebase data models, we might need to stringify canvas/elements
        // or just store the raw JSON string in 'description' or a new field 'config'.
        // We'll stringify it and store in the description for now to match the Omit<TemplateRecord>.
        config: JSON.stringify({ canvas: template.canvas, elements: template.elements })
      };
      // We pass it to saveTemplate. (We used 'any' cast here to allow config field without rewriting types).
      await FirebaseService.saveTemplate(payload as any);
      showToast("Template saved successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save template", "error");
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] w-full flex flex-col bg-[#06080f] rounded-2xl border border-white/10 overflow-hidden font-sans">
      
      {/* Top Toolbar */}
      <div className="h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={template.name}
            onChange={(e) => setTemplate({...template, name: e.target.value})}
            className="bg-transparent text-white font-bold text-lg focus:outline-none focus:bg-white/10 px-2 py-1 rounded"
          />
          <div className="w-px h-6 bg-white/20 mx-2" />
          <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
            <button onClick={() => addElement('text', 'Double click to edit', { width: 300, height: 60 }, { fontSize: 32, fontFamily: 'Inter', color: '#000000', fontWeight: 'bold', textAlign: 'center' })} className="p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Add Text"><Type size={18} /></button>
            <label className="p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white cursor-pointer" title="Add Image">
              <ImageIcon size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
            <button onClick={() => addElement('shape', 'rectangle', { width: 200, height: 200 }, { backgroundColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 0, borderRadius: 0 })} className="p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Add Rectangle"><Square size={18} /></button>
            <button onClick={() => addElement('shape', 'circle', { width: 200, height: 200 }, { backgroundColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 0, borderRadius: 100 })} className="p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Add Circle"><Circle size={18} /></button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1.5 hover:bg-white/10 rounded text-slate-300"><ZoomOut size={16} /></button>
            <span className="text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-white/10 rounded text-slate-300"><ZoomIn size={16} /></button>
          </div>
          <button onClick={saveToDatabase} className="gradient-btn px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Save className="w-4 h-4 z-10" /> <span className="z-10">Save to Cloud</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Layers & Settings */}
        <div className="w-64 bg-white/5 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Canvas</h3>
            <div className="space-y-3">
               <div>
                  <label className="text-xs text-slate-500 mb-1 flex justify-between">Dimensions<span>W × H</span></label>
                  <div className="flex gap-2">
                    <input type="number" value={template.canvas.width} onChange={e => setTemplate({...template, canvas: {...template.canvas, width: +e.target.value}})} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                    <input type="number" value={template.canvas.height} onChange={e => setTemplate({...template, canvas: {...template.canvas, height: +e.target.value}})} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                  </div>
               </div>
               <div>
                  <label className="text-xs text-slate-500 mb-1 block">Background Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={template.canvas.backgroundColor} onChange={e => setTemplate({...template, canvas: {...template.canvas, backgroundColor: e.target.value}})} className="w-8 h-8 rounded shrink-0 p-0 border-0" />
                    <input type="text" value={template.canvas.backgroundColor} readOnly className="w-full bg-black/30 border border-white/10 rounded px-2 text-xs text-mono text-white" />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Layers</h3>
            <div className="space-y-1 flex flex-col-reverse">
              {template.elements.map((el, i) => (
                <button 
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedId === el.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-white/5 border border-transparent'}`}
                >
                  <span className="truncate flex items-center gap-2">
                    {el.type === 'text' && <Type size={14} />}
                    {el.type === 'image' && <ImageIcon size={14} />}
                    {el.type === 'shape' && (el.content === 'circle' ? <Circle size={14} /> : <Square size={14} />)}
                    {el.type === 'text' ? el.content.substring(0, 15) || 'Text' : el.type}
                  </span>
                  {selectedId === el.id && <MousePointer2 size={12} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div 
          className="flex-1 overflow-auto bg-[#0c1120] relative items-center justify-center checkered-bg"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null) }}
        >
          <div className="min-w-fit min-h-fit p-10 flex items-center justify-center relative">
            {/* The actual paper */}
            <div 
              ref={canvasRef}
              className="relative shadow-2xl transition-transform origin-center"
              style={{ 
                width: template.canvas.width, 
                height: template.canvas.height, 
                backgroundColor: template.canvas.backgroundColor,
                transform: `scale(${zoom})`,
              }}
            >
              {template.elements.map((el) => {
                const isSelected = selectedId === el.id;
                
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleDragStart(e, el.id)}
                    className="absolute cursor-move overflow-visible"
                    style={{
                      left: el.position.x,
                      top: el.position.y,
                      width: el.size.width,
                      height: el.size.height,
                      zIndex: el.zIndex,
                      opacity: el.style.opacity,
                    }}
                  >
                    {/* Outline indicator */}
                    <div className={`absolute inset-0 pointer-events-none transition-opacity ${isSelected ? 'opacity-100 ring-2 ring-indigo-500 ring-offset-1' : 'opacity-0 hover:opacity-100 ring-1 ring-blue-400/50'}`} />

                    {/* Content */}
                    <div className="w-full h-full relative" style={{
                      backgroundColor: el.type === 'shape' ? el.style.backgroundColor : 'transparent',
                      borderColor: el.style.borderColor,
                      borderWidth: el.style.borderWidth,
                      borderRadius: el.style.borderRadius,
                      borderStyle: el.style.borderWidth ? 'solid' : 'none'
                    }}>
                      {el.type === 'text' && (
                        <div 
                          className="w-full h-full"
                          style={{
                            fontSize: el.style.fontSize,
                            fontFamily: el.style.fontFamily,
                            color: el.style.color,
                            fontWeight: el.style.fontWeight,
                            textAlign: el.style.textAlign,
                            lineHeight: 1.2,
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {el.content}
                        </div>
                      )}
                      
                      {el.type === 'image' && (
                        <img 
                          src={el.content} 
                          alt="element" 
                          className="w-full h-full object-cover" 
                          style={{ borderRadius: el.style.borderRadius }}
                          draggable={false}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white/5 border-l border-white/10 flex flex-col overflow-y-auto">
          {selectedElement ? (
            <div className="p-5 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white capitalize">{selectedElement.type} Properties</h3>
                <div className="flex gap-1">
                  <button onClick={bringForward} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white" title="Bring Forward"><BringToFront size={16} /></button>
                  <button onClick={sendBackward} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white" title="Send Backward"><SendToBack size={16} /></button>
                  <button onClick={deleteElement} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 ml-2" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Box Model (Size & Position) */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Geometry</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">X Offset</label>
                    <input type="number" value={selectedElement.position.x} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, position: {...el.position, x: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white uppercase" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Y Offset</label>
                    <input type="number" value={selectedElement.position.y} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, position: {...el.position, y: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white uppercase" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Width</label>
                    <input type="number" value={selectedElement.size.width} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, size: {...el.size, width: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white uppercase" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Height</label>
                    <input type="number" value={selectedElement.size.height} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, size: {...el.size, height: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white uppercase" />
                  </div>
                </div>
              </div>

              {selectedElement.type === 'text' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Text</h4>
                  <div className="space-y-3">
                    <textarea 
                      value={selectedElement.content}
                      onChange={(e) => updateContent(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white resize-y"
                      rows={3}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Font Selection</label>
                        <select value={selectedElement.style.fontFamily} onChange={(e) => updateStyle('fontFamily', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white">
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Outfit, sans-serif">Outfit</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="Courier New, monospace">Courier New</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                        <input type="number" value={selectedElement.style.fontSize} onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                    </div>

                    <div>
                       <label className="text-[10px] text-slate-500 mb-1 block">Color</label>
                       <div className="flex gap-2">
                         <input type="color" value={selectedElement.style.color} onChange={e => updateStyle('color', e.target.value)} className="w-8 h-8 rounded p-0 border-0 shadow-sm" />
                         <input type="text" value={selectedElement.style.color} readOnly className="w-full bg-black/40 border border-white/10 rounded px-2 text-xs text-white font-mono" />
                       </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Alignment</label>
                      <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button 
                            key={align}
                            onClick={() => updateStyle('textAlign', align)}
                            className={`flex-1 py-1.5 flex justify-center rounded ${selectedElement.style.textAlign === align ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                          >
                            {align === 'left' && <AlignLeft size={14} />}
                            {align === 'center' && <AlignCenter size={14} />}
                            {align === 'right' && <AlignRight size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedElement.type === 'shape' || selectedElement.type === 'image') && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Appearance</h4>
                  <div className="space-y-3">
                    {selectedElement.type === 'shape' && (
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Background</label>
                        <div className="flex gap-2">
                          <input type="color" value={selectedElement.style.backgroundColor} onChange={e => updateStyle('backgroundColor', e.target.value)} className="w-8 h-8 rounded p-0 border-0" />
                          <input type="text" value={selectedElement.style.backgroundColor} readOnly className="w-full bg-black/40 border border-white/10 rounded px-2 text-xs text-white font-mono" />
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Border Radius</label>
                        <input type="number" value={selectedElement.style.borderRadius} onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                      {selectedElement.type === 'shape' && (
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Border Width</label>
                          <input type="number" value={selectedElement.style.borderWidth} onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Pointer className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Select an element to edit its properties, or add a new one from the top menu.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Background Pattern injected via CSS for checkered transparent look */}
      <style dangerouslySetInnerHTML={{__html: `
        .checkered-bg {
          background-image: linear-gradient(45deg, #111827 25%, transparent 25%), linear-gradient(-45deg, #111827 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111827 75%), linear-gradient(-45deg, transparent 75%, #111827 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}} />
    </div>
  );
}
