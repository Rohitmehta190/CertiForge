"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FirebaseService, EventRecord } from "@/utils/firebaseService";
import BackButton from "@/components/BackButton";
import { useToast } from "@/contexts/ToastContext";
import { Users, Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Papa from "papaparse";

export default function BulkImportTicketsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [csvData, setCsvData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await FirebaseService.getEventById(eventId);
        setEvent(data);
      } catch (error) {
        showToast("Failed to load event details", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId, showToast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    if (uploadedFile.type !== "text/csv" && !uploadedFile.name.endsWith('.csv')) {
      showToast("Please upload a valid CSV file", "error");
      return;
    }

    setFile(uploadedFile);
    
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Validate columns
        if (!results.data.length) {
          showToast("CSV file is empty", "error");
          setFile(null);
          return;
        }
        
        const firstRow = results.data[0] as any;
        if (!firstRow.name || !firstRow.email) {
          showToast("CSV must contain 'name' and 'email' columns", "error");
          setFile(null);
          return;
        }
        
        setCsvData(results.data);
      },
      error: (error) => {
        showToast("Error parsing CSV: " + error.message, "error");
        setFile(null);
      }
    });
  };

  const handleGenerateBulk = async () => {
    if (!csvData.length) return;
    
    setIsProcessing(true);
    setProgress({ current: 0, total: csvData.length });
    
    let successCount = 0;
    
    for (let i = 0; i < csvData.length; i++) {
       const row = csvData[i];
       if (!row.name || !row.email) continue;
       
       try {
          const ticketId = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          const ticketData = {
            eventId,
            attendeeName: row.name,
            attendeeEmail: row.email,
            ticketType: row.type || "General Admission",
            ticketId,
            status: 'pending' as const,
          };
          
          const fakePdfBlob = new Blob(["fake-pdf-for-bulk"], { type: "application/pdf" });
          await FirebaseService.saveTicket(ticketData, fakePdfBlob);
          successCount++;
          
       } catch (error) {
          console.error("Failed for row:", row, error);
       }
       
       setProgress({ current: i + 1, total: csvData.length });
    }
    
    setIsProcessing(false);
    showToast(`Successfully created ${successCount} tickets!`, "success");
    
    setTimeout(() => {
       router.push(`/events/${eventId}`);
    }, 1500);
  };

  const handleDownloadTemplate = () => {
    const template = "name,email,type\nJohn Doe,john@example.com,VIP Pass";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ticket_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-20 text-center text-white">Loading...</div>;
  if (!event) return <div className="p-20 text-center text-white">Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="animate-fade-in-up">
        <BackButton to={`/events/${eventId}`} label="Back to Event" className="mb-4" />
        <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
           <Users className="w-8 h-8 text-blue-400" /> Bulk Import Attendees
        </h1>
        <p className="text-slate-400 text-lg">Upload a CSV to instantly issue tickets for {event.title}.</p>
      </div>

      <div className="glass-card p-8 rounded-[2rem] border border-blue-500/20 shadow-2xl animate-fade-in-up stagger-1">
         
         {!csvData.length ? (
           <div className="space-y-8">
              <div 
                className="border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-3xl p-12 text-center cursor-pointer transition-all bg-white/5 hover:bg-blue-500/5 flex flex-col items-center justify-center min-h-[300px]"
                onClick={() => fileInputRef.current?.click()}
              >
                 <div className="w-20 h-20 bg-blue-500/20 text-blue-400 flex items-center justify-center rounded-full mb-6">
                    <Upload className="w-10 h-10" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Upload CSV File</h3>
                 <p className="text-slate-400 font-medium">Click to browse or drag and drop here</p>
                 <input 
                   type="file" 
                   accept=".csv" 
                   className="hidden" 
                   ref={fileInputRef}
                   onChange={handleFileUpload}
                 />
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-bold text-blue-300 text-lg mb-1">CSV Format Requirements</h4>
                   <p className="text-slate-300 text-sm mb-4">Your file must include headers matching exactly: <code className="bg-black/40 px-2 py-1 rounded text-white font-mono">name</code>, <code className="bg-black/40 px-2 py-1 rounded text-white font-mono">email</code>, and optionally <code className="bg-black/40 px-2 py-1 rounded text-white font-mono">type</code>.</p>
                   <button onClick={handleDownloadTemplate} className="text-sm font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30">Download Sample Template</button>
                 </div>
              </div>
           </div>
         ) : (
           <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                 <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                 <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{file?.name} Processed</h3>
                    <p className="text-emerald-400 font-medium">{csvData.length} attendees found</p>
                 </div>
                 <button 
                   disabled={isProcessing}
                   onClick={() => setCsvData([])} 
                   className="text-sm text-slate-400 hover:text-white disabled:opacity-50"
                 >
                   Clear & Restart
                 </button>
              </div>

              {isProcessing ? (
                <div className="bg-black/40 p-8 rounded-2xl border border-white/10 text-center flex flex-col items-center">
                   <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                   <h3 className="text-xl font-bold text-white mb-2">Generating Tickets...</h3>
                   <div className="w-full max-w-md bg-white/10 h-3 rounded-full mt-4 overflow-hidden relative">
                      <div 
                         className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                         style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      ></div>
                   </div>
                   <p className="text-slate-400 mt-3 font-mono font-bold">{progress.current} of {progress.total}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="max-h-[300px] overflow-y-auto border border-white/10 rounded-2xl bg-black/40">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 sticky top-0">
                           <tr>
                              <th className="p-4 font-bold text-slate-300">Name</th>
                              <th className="p-4 font-bold text-slate-300">Email</th>
                              <th className="p-4 font-bold text-slate-300">Ticket Type</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {csvData.slice(0, 10).map((row, i) => (
                             <tr key={i}>
                                <td className="p-4 text-white">{row.name}</td>
                                <td className="p-4 text-slate-400">{row.email}</td>
                                <td className="p-4 text-indigo-300 font-medium">{row.type || "General Admission"}</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                     {csvData.length > 10 && (
                       <div className="p-3 text-center text-slate-500 bg-white/5 font-medium border-t border-white/5">
                          + {csvData.length - 10} more attendees
                       </div>
                     )}
                  </div>

                  <button onClick={handleGenerateBulk} className="gradient-btn w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20">
                     Issue All Tickets <ArrowRight className="w-5 h-5"/>
                  </button>
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
}
