"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { FirebaseService, EventRecord, TicketRecord } from "@/utils/firebaseService";
import { useToast } from "@/contexts/ToastContext";
import BackButton from "@/components/BackButton";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { CheckCircle, AlertCircle, Clock, Video, Camera } from "lucide-react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function TicketScannerPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    ticket?: TicketRecord;
    message: string;
  } | null>(null);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventData, ticketsData] = await Promise.all([
          FirebaseService.getEventById(eventId),
          FirebaseService.getEventTickets(eventId)
        ]);
        setEvent(eventData);
        setTickets(ticketsData || []);
      } catch (error) {
        console.error("Error loading scanner data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (!loading && event) {
      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          false
        );

        scannerRef.current.render(onScanSuccess, onScanFailure);
      }
    }

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [loading, event]);

  const handleManualCheckIn = async (ticketIdInput: string) => {
    const ticket = tickets.find(t => t.ticketId === ticketIdInput);
    
    if (!ticket) {
      setScanResult({ success: false, message: "Ticket not found in this event." });
      // Clear result after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    if (ticket.status === 'checked-in') {
      setScanResult({ 
        success: false, 
        ticket, 
        message: "Ticket has already been used!" 
      });
      setTimeout(() => setScanResult(null), 5000);
      return;
    }

    // Process valid check-in
    try {
      // Update local state immediately for fast scanning
      setTickets(prev => prev.map(t => 
        t.ticketId === ticket.ticketId ? { ...t, status: 'checked-in' } : t
      ));

      setScanResult({ success: true, ticket, message: "Check-in successful!" });
      setTimeout(() => setScanResult(null), 4000);

      // Persist to Firebase in background
      const ticketRef = doc(db, "events", eventId, "tickets", ticket.id);
      await updateDoc(ticketRef, {
        status: 'checked-in',
        scannedAt: Timestamp.now()
      });
      
    } catch (error) {
      console.error("Error updating ticket status:", error);
      showToast("Error saving check-in to database", "error");
    }
  };

  const onScanSuccess = (decodedText: string) => {
    // Attempt processing the decoded text as a ticket ID
    handleManualCheckIn(decodedText);
  };

  const onScanFailure = (error: any) => {
    // usually noisy, ignore
  };

  if (loading) return <div className="text-center pt-20 text-slate-400">Loading scanner...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <BackButton to={`/events/${eventId}`} label="Back to Event" className="mb-3" />
          <h1 className="text-2xl font-bold text-white mb-1 font-outfit">Live Quick Scan</h1>
          <p className="text-sm text-slate-500">Scan attendee QR codes to check them in.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-white">
            {tickets.filter(t => t.status === 'checked-in').length} / {tickets.length}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Checked In</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner Viewport */}
        <div className="glass-card p-6 flex flex-col items-center">
           <div className="w-full relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-square md:aspect-[4/3] flex items-center justify-center">
             <div id="reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full border-none"></div>
             {/* Note: The html5-qrcode library injects its own DOM, so CSS overrides are often needed. We containerize it here. */}
           </div>
           
           <div className="mt-6 w-full flex items-center gap-4">
             <div className="h-px bg-white/10 flex-1"></div>
             <span className="text-xs text-slate-500 uppercase font-semibold">Or Enter Manually</span>
             <div className="h-px bg-white/10 flex-1"></div>
           </div>

           <form 
              className="mt-6 w-full flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('ticketId') as HTMLInputElement;
                if(input.value) handleManualCheckIn(input.value);
                input.value = '';
              }}
           >
             <input 
               type="text" 
               name="ticketId"
               placeholder="Enter Ticket ID..." 
               className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white font-mono"
             />
             <button type="submit" className="bg-indigo-500/20 text-indigo-300 px-4 rounded-xl font-medium hover:bg-indigo-500/30">Verify</button>
           </form>
        </div>

        {/* Scan Results Panel */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-white font-outfit mb-4">Latest Scan Result</h3>
          
          <div className="flex-1 glass-card p-6 flex items-center justify-center">
            {scanResult ? (
              <div className={`w-full text-center p-6 rounded-2xl border ${scanResult.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} animate-fade-in`}>
                {scanResult.success ? (
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                )}
                
                <h2 className={`text-2xl font-bold mb-2 ${scanResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {scanResult.message}
                </h2>

                {scanResult.ticket && (
                  <div className="mt-6 space-y-3 text-left bg-black/20 p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">Attendee</div>
                        <div className="font-medium text-white">{scanResult.ticket.attendeeName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">Type</div>
                        <div className="font-medium text-indigo-300">{scanResult.ticket.ticketType}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold">Ticket ID</div>
                      <div className="font-mono text-sm text-slate-300">{scanResult.ticket.ticketId}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 flex flex-col items-center">
                <Camera className="w-12 h-12 mb-3 opacity-20" />
                <p>Waiting for scan...</p>
                <p className="text-xs opacity-60 mt-1">Point the camera at a ticket QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
