"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FirebaseService } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { 
  Type, Image as ImageIcon, Square, Circle, Save, Pointer,
  Move, Minimize2, BringToFront, SendToBack, Copy, Trash2,
  ZoomIn, ZoomOut, Check, AlignLeft, AlignCenter, AlignRight,
  MousePointer2, Upload, Wand2
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
      <div className="h-16 bg-[#0c1120]/80 backdrop-blur-xl border-b border-indigo-500/20 flex items-center justify-between px-6 shadow-xl relative z-10">
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
            <button onClick={() => addElement('shape', 'rectangle', { width: 200, height: 200 }, { backgroundColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 0, borderRadius: 0 })} className="p-2 hover:bg-zinc-800 rounded text-slate-300 hover:text-white transition-colors" title="Add Rectangle"><Square size={18} /></button>
            <button onClick={() => addElement('shape', 'circle', { width: 200, height: 200 }, { backgroundColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 0, borderRadius: 100 })} className="p-2 hover:bg-zinc-800 rounded text-slate-300 hover:text-white transition-colors" title="Add Circle"><Circle size={18} /></button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button 
              onClick={() => {
                showToast("Magic Format Applied! ✨", "success");
                setTemplate(prev => ({
                  ...prev,
                  elements: prev.elements.map(el => {
                    if (el.type === 'text') {
                      return { ...el, style: { ...el.style, fontFamily: 'Outfit, sans-serif', color: '#1e1b4b', textAlign: 'center' } };
                    }
                    return el;
                  })
                }));
              }} 
              className="p-2 text-pink-400 hover:bg-pink-500/20 hover:text-pink-300 rounded transition-colors" 
              title="Magic Auto-Format Typography"
            >
              <Wand2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 bg-black/30 rounded-xl p-1 border border-white/5 shadow-inner">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"><ZoomOut size={16} /></button>
            <span className="text-xs font-mono w-10 text-center text-slate-300">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"><ZoomIn size={16} /></button>
          </div>
          <button onClick={saveToDatabase} className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
            <Save className="w-4 h-4 z-10" /> <span className="z-10">Publish Template</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Layers & Settings */}
        <div className="w-72 bg-[#080b14] border-r border-indigo-500/10 flex flex-col z-10 shadow-xl shadow-black/50">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Canvas Configuration</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center justify-between">Dimensions <span className="text-slate-600">W × H</span></label>
                  <div className="flex gap-2">
                    <input type="number" value={template.canvas.width} onChange={e => setTemplate({...template, canvas: {...template.canvas, width: +e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-indigo-100 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    <input type="number" value={template.canvas.height} onChange={e => setTemplate({...template, canvas: {...template.canvas, height: +e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-indigo-100 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest block">Background Base</label>
                  <div className="flex gap-2 items-center bg-black/40 p-1.5 rounded-xl border border-white/10">
                    <input type="color" value={template.canvas.backgroundColor} onChange={e => setTemplate({...template, canvas: {...template.canvas, backgroundColor: e.target.value}})} className="w-8 h-8 rounded-lg shrink-0 p-0 border-0 cursor-pointer shadow-inner shadow-black/50" />
                    <input type="text" value={template.canvas.backgroundColor} readOnly className="w-full bg-transparent px-2 text-xs font-mono text-slate-300 outline-none cursor-default uppercase" />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Layer Stack</h3>
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
        <div className="w-80 bg-[#080b14] border-l border-indigo-500/10 flex flex-col overflow-y-auto z-10 shadow-xl shadow-black/50 mt-16 md:mt-0">
          {selectedElement ? (
            <div className="p-6 space-y-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedElement.type} Node</h3>
                <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                  <button onClick={bringForward} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Bring Forward"><BringToFront size={16} /></button>
                  <button onClick={sendBackward} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Send Backward"><SendToBack size={16} /></button>
                  <div className="w-px h-4 bg-white/10 mx-0.5 my-auto" />
                  <button onClick={deleteElement} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Box Model (Size & Position) */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Geometry Bounds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">X Position</label>
                    <input type="number" value={Math.round(selectedElement.position.x)} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, position: {...el.position, x: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">Y Position</label>
                    <input type="number" value={Math.round(selectedElement.position.y)} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, position: {...el.position, y: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">Width</label>
                    <input type="number" value={Math.round(selectedElement.size.width)} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, size: {...el.size, width: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">Height</label>
                    <input type="number" value={Math.round(selectedElement.size.height)} onChange={e => {
                      const newTemplate = {...template, elements: template.elements.map(el => el.id === selectedId ? {...el, size: {...el.size, height: +e.target.value}} : el)};
                      setTemplate(newTemplate);
                    }} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                </div>
              </div>

              {selectedElement.type === 'text' && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">Text Properties</h4>
                  <div className="space-y-4">
                    <textarea 
                      value={selectedElement.content}
                      onChange={(e) => updateContent(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[13px] text-white resize-y outline-none focus:border-indigo-500/50 transition-colors shadow-inner"
                      rows={3}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">Font Family</label>
                        <select value={selectedElement.style.fontFamily} onChange={(e) => updateStyle('fontFamily', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50 appearance-none bg-none shadow-inner">
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Outfit, sans-serif">Outfit</option>
                          <option value="Playfair Display, serif">Playfair Display (Serif)</option>
                          <option value="Courier New, monospace">Courier (Mono)</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">Font Size</label>
                        <input type="number" value={selectedElement.style.fontSize} onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500/50 transition-colors shadow-inner" />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">Text Color</label>
                         <div className="flex gap-2 items-center bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
                           <input type="color" value={selectedElement.style.color} onChange={e => updateStyle('color', e.target.value)} className="w-7 h-7 rounded-sm shrink-0 p-0 border-0 cursor-pointer" />
                           <input type="text" value={selectedElement.style.color} readOnly className="w-full bg-transparent px-1 text-[10px] font-mono text-slate-300 outline-none cursor-default uppercase" />
                         </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 block">Alignment</label>
                      <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 w-max shadow-inner">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button 
                            key={align}
                            onClick={() => updateStyle('textAlign', align)}
                            className={`px-4 py-1.5 flex justify-center rounded-lg transition-colors ${selectedElement.style.textAlign === align ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
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
