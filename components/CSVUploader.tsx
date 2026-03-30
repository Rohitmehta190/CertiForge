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

  const processFile = useCallback((file: File) => {
    setIsProcessing(true);
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Record<string, string>[];
          
          // Validate required fields
          const requiredFields = ['name', 'email', 'course'];
          const headers = Object.keys(data[0] || {});
          
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
          }

          // Validate and clean data
          const cleanedData: CSVData[] = data
            .filter(row => row.name && row.email && row.course)
            .map(row => ({
              name: row.name?.trim() || "",
              email: row.email?.trim().toLowerCase() || "",
              course: row.course?.trim() || "",
              date: row.date?.trim() || new Date().toISOString().split('T')[0]
            }));

          if (cleanedData.length === 0) {
            throw new Error("No valid data found in CSV file");
          }

          // Check for duplicate emails
          const emails = cleanedData.map(item => item.email);
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
      }
    });
  }, [onDataParsed]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (!csvFile) {
      setError("Please upload a CSV file");
      return;
    }

    processFile(csvFile);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes('csv') && !selectedFile.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }

    processFile(selectedFile);
  }, [processFile]);

  const handleRemoveFile = () => {
    setFile(null);
    setError("");
    onDataParsed([]);
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-white bg-zinc-800' 
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-white font-medium">
              {isProcessing ? "Processing..." : "Drop your CSV file here, or click to browse"}
            </p>
            <p className="text-zinc-400 text-sm mt-1">
              CSV files with columns: name, email, course (date is optional)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {file && !error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-zinc-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
