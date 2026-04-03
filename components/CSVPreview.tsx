"use client";

import { useState } from "react";

interface CSVData {
  name: string;
  email: string;
  course: string;
  date?: string;
}

interface CSVPreviewProps {
  data: CSVData[];
}

export default function CSVPreview({ data }: CSVPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  if (data.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div
          className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
          style={{ background: "rgba(99, 102, 241, 0.06)" }}
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-slate-600">Upload a CSV file to preview data</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Preview
            <span className="ml-2 text-xs font-normal text-indigo-400">
              {data.length} recipients
            </span>
          </h3>
          <span className="text-xs text-slate-600">
            {startIndex + 1}–{Math.min(endIndex, data.length)} of {data.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(99, 102, 241, 0.04)" }}>
              {["Name", "Email", "Course", "Date"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr
                key={index}
                className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3 whitespace-nowrap text-sm text-white">{row.name}</td>
                <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-400">{row.email}</td>
                <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-400">{row.course}</td>
                <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-400">
                  {row.date || new Date().toISOString().split("T")[0]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-white hover:bg-white/[0.04]"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-white hover:bg-white/[0.04]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
