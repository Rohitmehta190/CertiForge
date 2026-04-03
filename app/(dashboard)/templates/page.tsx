"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import TemplatePreview from "@/components/TemplatePreview";
import ConfirmModal from "@/components/ConfirmModal";

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  isDefault: boolean;
}

const defaultTemplates: Template[] = [
  { id: "default", name: "Default Template", description: "Clean and professional blue design", preview: "🎓", isDefault: true },
  { id: "modern", name: "Modern Template", description: "Dark theme with contemporary styling", preview: "🏆", isDefault: true },
  { id: "classic", name: "Classic Template", description: "Traditional certificate with elegant borders", preview: "📜", isDefault: true },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [isCreating, setIsCreating] = useState(false);
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
        preview: "🎨",
        isDefault: false,
      };

      setTemplates([...templates, newTemplate]);
      setNewTemplateName("");
      setNewTemplateDescription("");
      setIsCreating(false);
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
    setTemplates(templates.filter((t) => t.id !== deleteTarget.id));
    showToast("Template deleted", "success");
    setDeleteTarget(null);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId);
    showToast("Template selected", "info");
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) setSelectedTemplate(saved);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Certificate Templates</h1>
          <p className="text-sm text-slate-500">Create and manage custom certificate templates</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/upload")}
          className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold active:scale-[0.97] shrink-0"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Certificates
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div className="space-y-6 animate-fade-in-up stagger-1">
          <h2 className="text-base font-semibold text-white">Select Template</h2>
          <div className="glass-card p-4">
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: selectedTemplate === template.id ? "rgba(99, 102, 241, 0.08)" : "transparent",
                    border: `1px solid ${selectedTemplate === template.id ? "rgba(99, 102, 241, 0.2)" : "transparent"}`,
                  }}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-200"
                    style={{
                      background: selectedTemplate === template.id
                        ? "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))"
                        : "rgba(99, 102, 241, 0.06)",
                    }}
                  >
                    {selectedTemplate === template.id ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{template.preview}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white">{template.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{template.description}</p>
                  </div>
                  {template.isDefault && (
                    <span
                      className="px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0"
                      style={{ background: "rgba(99, 102, 241, 0.08)", color: "var(--cf-accent-3)", border: "1px solid rgba(99, 102, 241, 0.12)" }}
                    >
                      Default
                    </span>
                  )}
                  {!template.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(template);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create New Template */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Template
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow"
                  style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.1)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow resize-none"
                  style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(99, 102, 241, 0.1)" }}
                />
              </div>
              <button
                type="button"
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim() || isCreating}
                className="w-full gradient-btn px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 rounded-full" style={{ border: "2px solid transparent", borderTopColor: "white", animation: "spin-slow 0.8s linear infinite" }} />
                      Creating...
                    </>
                  ) : (
                    "Create Template"
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Template Preview */}
        <div className="space-y-6 animate-fade-in-up stagger-2">
          <h2 className="text-base font-semibold text-white">Live Certificate Preview</h2>
          <TemplatePreview onSelectTemplate={handleSelectTemplate} selectedTemplate={selectedTemplate} />
        </div>
      </div>

      {/* All Templates Grid */}
      <div className="animate-fade-in-up stagger-3">
        <h2 className="text-lg font-semibold text-white mb-4">All Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="glass-card glass-card-hover p-5 text-center cursor-pointer"
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
                style={{
                  background: selectedTemplate === template.id
                    ? "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))"
                    : "rgba(99, 102, 241, 0.06)",
                }}
              >
                {selectedTemplate === template.id ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  template.preview
                )}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{template.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{template.description}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTemplate(template.id);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.97] ${
                  selectedTemplate === template.id
                    ? "gradient-btn"
                    : "text-slate-400 border border-white/[0.06] hover:bg-white/[0.03]"
                }`}
              >
                <span className="relative z-10">
                  {selectedTemplate === template.id ? "Selected" : "Select Template"}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

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
