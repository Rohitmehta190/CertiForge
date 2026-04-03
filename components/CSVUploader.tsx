"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";

interface CSVData {
  name: string;
  email: string;
  course: string;
  date?: string;
}

interface CSVUploaderProps {
  onDataParsed: (data: CSVData[]) => void;
}

export default function CSVUploader({ onDataParsed }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setIsProcessing(true);
      setError("");

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data as Record<string, string>[];
            const requiredFields = ["name", "email", "course"];
            const headers = Object.keys(data[0] || {});

            const missingFields = requiredFields.filter((field) => !headers.includes(field));
            if (missingFields.length > 0) {
              throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
            }

            const cleanedData: CSVData[] = data
              .filter((row) => row.name && row.email && row.course)
              .map((row) => ({
                name: row.name?.trim() || "",
                email: row.email?.trim().toLowerCase() || "",
                course: row.course?.trim() || "",
                date: row.date?.trim() || new Date().toISOString().split("T")[0],
              }));

            if (cleanedData.length === 0) {
              throw new Error("No valid data found in CSV file");
            }

            const emails = cleanedData.map((item) => item.email);
            const uniqueEmails = new Set(emails);
            if (emails.length !== uniqueEmails.size) {
              throw new Error("Duplicate email addresses found in CSV file");
            }

            onDataParsed(cleanedData);
            setFile(file);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to process CSV file");
          } finally {
            setIsProcessing(false);
          }
        },
        error: (error) => {
          setError(`CSV parsing error: ${error.message}`);
          setIsProcessing(false);
        },
      });
    },
    [onDataParsed]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find((file) => file.type === "text/csv" || file.name.endsWith(".csv"));

      if (!csvFile) {
        setError("Please upload a CSV file");
        return;
      }

      processFile(csvFile);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!selectedFile.type.includes("csv") && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      processFile(selectedFile);
    },
    [processFile]
  );

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    onDataParsed([]);
  };

  return (
    <div className="space-y-3">
      <div
        className="relative rounded-xl p-8 text-center transition-all duration-300 cursor-pointer"
        style={{
          background: isDragging ? "rgba(99, 102, 241, 0.06)" : "rgba(15, 23, 42, 0.4)",
          border: `2px dashed ${isDragging ? "rgba(99, 102, 241, 0.5)" : "rgba(99, 102, 241, 0.12)"}`,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="space-y-3">
          <div
            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
            style={{
              background: isDragging
                ? "linear-gradient(135deg, var(--cf-accent-1), var(--cf-accent-2))"
                : "rgba(99, 102, 241, 0.08)",
            }}
          >
            <svg
              className={`w-6 h-6 transition-colors duration-300 ${isDragging ? "text-white" : "text-indigo-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300">
              {isProcessing ? "Processing..." : "Drop your CSV file here, or click to browse"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              CSV files with columns: name, email, course (date is optional)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-fade-in"
          style={{
            background: "rgba(239, 68, 68, 0.06)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {file && !error && (
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(16, 185, 129, 0.1)" }}
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
