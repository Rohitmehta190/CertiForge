"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import CertificateTemplate from "@/components/CertificateTemplate";
import ConfirmModal from "@/components/ConfirmModal";
import Link from "next/link";
import { Palette, Plus, ArrowRight, LayoutTemplate, Star, Crown } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  tag?: string;
  isDefault: boolean;
}

const defaultTemplates: Template[] = [
  { id: "default", name: "Vibrant Mesh", description: "Premium glassmorphism over colorful mesh", tag: "Popular", isDefault: true },
  { id: "modern", name: "Modern Dark", description: "Sleek dark theme with glowing neon accents", tag: "Pro", isDefault: true },
  { id: "classic", name: "Elegant Classic", description: "Traditional parchment with golden elements", tag: "Classic", isDefault: true },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    setIsCreating(true);
    setTimeout(() => {
      const newTemplate: Template = {
        id: `custom-${Date.now()}`,
        name: newTemplateName,
        description: newTemplateDescription,
        isDefault: false,
      };
      setTemplates([...templates, newTemplate]);
      setNewTemplateName("");
      setNewTemplateDescription("");
      setIsCreating(false);
      setShowCreateModal(false);
      showToast("Template created successfully!", "success");
    }, 800);
  };

  const handleDeleteTemplate = () => {
    if (!deleteTarget) return;
    if (deleteTarget.isDefault) {
      showToast("Cannot delete default templates", "warning");
      setDeleteTarget(null);
      return;
    }
    if (selectedTemplate === deleteTarget.id) {
        setSelectedTemplate("default");
    }
    setTemplates(templates.filter((t) => t.id !== deleteTarget.id));
    showToast("Template deleted", "success");
    setDeleteTarget(null);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId);
    showToast("Template selected", "success");
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) setSelectedTemplate(saved);
  }, []);

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Hero Section */}
      <div className="relative w-full rounded-[2.5rem] p-8 md:p-12 overflow-hidden animate-fade-in-up border border-white/5" style={{ background: "linear-gradient(145deg, #0f172a, #020617)" }}>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <Palette className="w-3.5 h-3.5" />
                <span>Theme Store</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
               Discover Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Certificate Style</span>
             </h1>
             <p className="text-lg text-slate-400 mb-8 leading-relaxed">
               Choose from our premium collection of meticulously crafted designs to make your attendees feel truly special.
             </p>
             <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/upload")}
                  className="gradient-btn px-6 py-3.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all shadow-xl shadow-indigo-500/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Start Generating
                  </span>
                </button>
             </div>
          </div>
          
          <div className="w-full md:w-[400px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
             <CertificateTemplate
                recipientName="Alex Designer"
                courseName="UX Mastery"
                date="Today"
                certificateId="PREVIEW-01"
                template={selectedTemplate}
             />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-fade-in-up stagger-1 space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-indigo-400" /> All Templates
           </h2>
           <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all">
              <Plus className="w-4 h-4" /> Custom Template
           </button>
        </div>

        {/* Template Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className={`relative group cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black scale-[1.02]' : 'hover:scale-[1.01] hover:ring-1 hover:ring-white/20'}`}
                style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                {/* Badge layout */}
                {template.tag && (
                  <div className="absolute top-4 right-4 z-20">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${template.tag === 'Pro' ? 'bg-indigo-500 text-white' : template.tag === 'Classic' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {template.tag === 'Pro' && <Crown className="w-3 h-3" />}
                        {template.tag === 'Popular' && <Star className="w-3 h-3" />}
                        {template.tag}
                     </span>
                  </div>
                )}
                
                {/* Visual Preview */}
                <div className="aspect-[4/3] w-full relative border-b border-white/5 pointer-events-none overflow-hidden">
                   <div className="absolute inset-0 scale-[1.02] filter brightness-95 group-hover:brightness-105 transition-all duration-500">
                     <CertificateTemplate
                        recipientName="Demo User"
                        courseName="Course Preview"
                        date="202X"
                        certificateId="PREVIEW"
                        template={template.id}
                     />
                   </div>
                   {isSelected && <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />}
                </div>

                {/* Info & Actions */}
                <div className="p-5 flex flex-col gap-1 relative z-10 bg-slate-900/50 backdrop-blur-md">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     {template.name}
                     {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                   </h3>
                   <p className="text-sm text-slate-400 line-clamp-1">{template.description}</p>
                   
                   <div className="flex items-center justify-between mt-4">
                     <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-300 group-hover:bg-white/10'}`}>
                        {isSelected ? 'Active Template' : 'Use Template'}
                     </button>
                     
                     {!template.isDefault && (
                       <button
                         onClick={(e) => { e.stopPropagation(); setDeleteTarget(template); }}
                         className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                     )}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-scale-up" onClick={(e) => e.stopPropagation()}>
             <h3 className="text-xl font-bold text-white mb-4">Create Custom Template</h3>
             <div className="space-y-4 mb-6">
                <div>
                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Template Name</label>
                   <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600" placeholder="e.g. My Organization Theme" autoFocus />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                   <textarea value={newTemplateDescription} onChange={(e) => setNewTemplateDescription(e.target.value)} rows={2} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none placeholder-slate-600" placeholder="Brief description..." />
                </div>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 px-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors">Cancel</button>
                <button onClick={handleCreateTemplate} disabled={!newTemplateName.trim() || isCreating} className="flex-1 gradient-btn py-3 px-4 rounded-xl font-semibold opacity-100 disabled:opacity-50 transition-opacity flex justify-center items-center">
                   {isCreating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create'}
                </button>
             </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
