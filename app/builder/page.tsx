"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import TemplateBuilder from "@/components/TemplateBuilder";

export default function BuilderPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TemplateBuilder />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
