"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import TemplatePreview from "@/components/TemplatePreview";
import BackButton from "@/components/BackButton";

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  isDefault: boolean;
}

const defaultTemplates: Template[] = [
  {
    id: "default",
    name: "Default Template",
    description: "Clean and professional blue design",
    preview: "🎓",
    isDefault: true
  },
  {
    id: "modern", 
    name: "Modern Template",
    description: "Dark theme with contemporary styling",
    preview: "🏆",
    isDefault: true
  },
  {
    id: "classic",
    name: "Classic Template", 
    description: "Traditional certificate with elegant borders",
    preview: "📜",
    isDefault: true
  }
];

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    
    setIsCreating(true);
    setTimeout(() => {
      const newTemplate: Template = {
        id: `custom-${Date.now()}`,
        name: newTemplateName,
        description: newTemplateDescription,
        preview: "🎨",
        isDefault: false
      };
      
      setTemplates([...templates, newTemplate]);
      setNewTemplateName("");
      setNewTemplateDescription("");
      setIsCreating(false);
      
      alert("Template created successfully!");
    }, 1000);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (templates.find(t => t.id === templateId)?.isDefault) {
      alert("Cannot delete default templates");
      return;
    }
    
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(templates.filter(t => t.id !== templateId));
      alert("Template deleted successfully!");
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId);
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");
    if (saved) {
      setSelectedTemplate(saved);
    }
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <BackButton 
                to="/dashboard" 
                label="Back to Dashboard"
                className="mb-2"
              />
              <h1 className="text-3xl font-bold text-white mb-2">Certificate Templates</h1>
              <p className="text-zinc-400">
                Create and manage custom certificate templates
              </p>
            </div>
            <button
              onClick={() => window.location.href = "/upload"}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
            >
              Generate Certificates
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Selection */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Select Template</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-white bg-white/10'
                          : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
                      }`}
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{template.preview}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{template.name}</h3>
                          <p className="text-sm text-zinc-400">{template.description}</p>
                          {template.isDefault && (
                            <span className="inline-block px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full mt-2">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create New Template */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Template</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Enter template name..."
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Brief description..."
                      rows={3}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    onClick={handleCreateTemplate}
                    disabled={!newTemplateName.trim() || isCreating}
                    className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Template"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Template Preview */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Live Certificate Preview</h2>
              <TemplatePreview
                onSelectTemplate={handleSelectTemplate}
                selectedTemplate={selectedTemplate}
              />
            </div>
          </div>

          {/* Template List */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">All Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{template.preview}</div>
                    <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-zinc-400 mb-4">{template.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSelectTemplate(template.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Select
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">{template.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <button className="text-sm text-zinc-300 hover:text-white transition-colors">
                        Edit Template
                      </button>
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Template Management</h3>
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">•</span>
                <p>Click on any template to edit its properties</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">•</span>
                <p>Default templates cannot be deleted or modified</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">•</span>
                <p>Custom templates can be edited and deleted</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">•</span>
                <p>Templates are automatically saved to your account</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
